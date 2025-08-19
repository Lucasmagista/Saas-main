/*
 * Rotas para gerenciamento de bots com sessões independentes. Estas rotas
 * permitem iniciar e parar sessões, bem como recuperar QR codes e logs.
 * A implementação atual utiliza um gerenciador de sessões em memória. Para
 * persistência, os logs e QR codes devem ser salvos/atualizados na base de dados.
 */

const express = require('express');
const { z } = require('zod');
const validate = require('../middleware/validate.cjs');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const url = require('url');
const logger = require('../logger.cjs');
const { logAudit } = require('../auditHelper.cjs');
const { startSession, stopSession, getQrcode, getLogs, isSessionActive } = require('../services/botManager.cjs');
const botsRepo = require('../repositories/botsRepository.cjs');
const botLogsRepo = require('../repositories/botLogsRepository.cjs');

const router = express.Router();
const { createPaginationMiddleware } = require('../middleware/pagination.cjs');
const { withETag } = require('../middleware/etag.cjs');
const { idempotency } = require('../middleware/idempotency.cjs');

// Schemas de validação
const createBotSchema = z.object({
  name: z.string({ required_error: 'Nome é obrigatório' }).min(1),
  type: z.string({ required_error: 'Tipo é obrigatório' }).min(1),
  config: z.any().optional(),
  description: z.string().optional(),
});

// Configure multer for handling file uploads
const upload = multer({ dest: path.join(__dirname, '../../uploads') });

// Helper para validar URLs
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Helper para fazer requisições HTTP/HTTPS
async function makeRequest(urlString, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = url.parse(urlString);
    const isHttps = parsedUrl.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.path,
      method: 'GET',
      headers: {
        'User-Agent': 'saas-platform-bot-importer/1.0',
        ...options.headers
      },
      timeout: 10000
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ statusCode: res.statusCode, data, headers: res.headers });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

// Helper to scan a local file list and extract metadata (entry point, dependencies)
async function scanLocalFiles(files) {
  const fileNames = files.map((f) => f.originalname);
  // Attempt to find a package.json among uploaded files
  let dependencies = [];
  let entryPoint = null;
  let hasValidFiles = false;
  
  for (const file of files) {
    if (file.originalname.toLowerCase() === 'package.json') {
      try {
        const pkgRaw = fs.readFileSync(file.path, 'utf8');
        const pkg = JSON.parse(pkgRaw);
        dependencies = pkg.dependencies ? Object.keys(pkg.dependencies) : [];
        entryPoint = pkg.main || 'index.js';
        hasValidFiles = true;
      } catch (e) {
        logger.error('Erro ao analisar package.json:', e);
      }
    }
    
    // Verificar se é um arquivo JavaScript/TypeScript válido
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.js', '.jsx', '.ts', '.tsx', '.json'].includes(ext)) {
      hasValidFiles = true;
    }
  }
  
  if (!hasValidFiles) {
    throw new Error('Nenhum arquivo válido encontrado. Suportamos: .js, .jsx, .ts, .tsx, .json');
  }
  
  return { fileNames, dependencies, entryPoint };
}

// Helper to fetch file list and package.json from a remote repository
async function scanRemoteRepo(repoUrl) {
  if (!isValidUrl(repoUrl)) {
    throw new Error('URL inválida fornecida');
  }

  // Suporte para GitHub, GitLab e URLs diretas
  let apiUrl, headers = {};
  
  if (repoUrl.includes('github.com')) {
    // GitHub API
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?$/i);
    if (!match) {
      throw new Error('URL do GitHub inválida. Formato esperado: https://github.com/user/repo');
    }
    const [, owner, repo] = match;
    apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents`;
    headers = {
      'User-Agent': 'saas-platform-bot-importer',
      'Accept': 'application/vnd.github.v3+json'
    };
    
    // Adicionar token se disponível
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
    }
  } else if (repoUrl.includes('gitlab.com')) {
    // GitLab API
    const match = repoUrl.match(/gitlab\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?$/i);
    if (!match) {
      throw new Error('URL do GitLab inválida. Formato esperado: https://gitlab.com/user/repo');
    }
    const [, owner, repo] = match;
    apiUrl = `https://gitlab.com/api/v4/projects/${encodeURIComponent(`${owner}/${repo}`)}/repository/tree`;
    headers = {
      'User-Agent': 'saas-platform-bot-importer'
    };
    
    if (process.env.GITLAB_TOKEN) {
      headers['PRIVATE-TOKEN'] = process.env.GITLAB_TOKEN;
    }
  } else {
    // URL direta - tentar acessar como arquivo
    try {
      const response = await makeRequest(repoUrl);
      const fileName = path.basename(repoUrl);
      return { 
        fileNames: [fileName], 
        dependencies: [], 
        entryPoint: fileName,
        directUrl: true 
      };
    } catch (error) {
      throw new Error(`Não foi possível acessar a URL: ${error.message}`);
    }
  }

  try {
    const response = await makeRequest(apiUrl, { headers });
    const files = JSON.parse(response.data);
    
    if (!Array.isArray(files)) {
      throw new Error('Resposta inesperada da API do repositório');
    }
    
    const fileNames = files.map(item => item.name);
    let dependencies = [];
    let entryPoint = null;
    
    // Buscar package.json
    const pkgFile = files.find(item => item.name.toLowerCase() === 'package.json');
    if (pkgFile && pkgFile.download_url) {
      try {
        const pkgResponse = await makeRequest(pkgFile.download_url, { headers });
        const pkg = JSON.parse(pkgResponse.data);
        dependencies = pkg.dependencies ? Object.keys(pkg.dependencies) : [];
        entryPoint = pkg.main || 'index.js';
      } catch (e) {
        logger.warn('Erro ao analisar package.json do repositório remoto:', e);
      }
    }
    
    // Verificar se há arquivos válidos
    const validFiles = fileNames.filter(name => {
      const ext = path.extname(name).toLowerCase();
      return ['.js', '.jsx', '.ts', '.tsx', '.json'].includes(ext);
    });
    
    if (validFiles.length === 0) {
      throw new Error('Nenhum arquivo válido encontrado no repositório');
    }
    
    return { fileNames, dependencies, entryPoint };
  } catch (error) {
    throw new Error(`Erro ao acessar repositório: ${error.message}`);
  }
}

// GET /bots - list bots from database
router.get('/', createPaginationMiddleware(['name', 'created_at', 'updated_at']), withETag(async (req, res) => {
  try {
    const { limit, offset, orderBy, order } = res.locals.pagination;
    const orderClause = orderBy ? ` ORDER BY ${orderBy} ${order.toUpperCase()}` : ' ORDER BY created_at DESC';
    const db = require('../postgresClient.cjs');
    const total = await db.query('SELECT COUNT(1) AS count FROM bots');
    const result = await db.query(`SELECT * FROM bots${orderClause} LIMIT $1 OFFSET $2`, [limit, offset]);
    res.set('X-Total-Count', String(total.rows[0].count));
    res.json(result.rows);
  } catch (error) {
    logger.error('Erro ao listar bots:', error);
    res.status(500).json({ error: error.message });
  }
}));

// POST /bots - Cria bot diretamente
router.post('/', idempotency(), upload.none(), validate({ body: createBotSchema }), async (req, res) => {
  try {
    const { name, type, config, description } = req.body;
    const bot = await botsRepo.insert({ name, type, config, description: description || null });
    await logAudit({ req, action: 'create', resourceType: 'bot', resourceId: bot.id, newValues: bot });
    res.json({ success: true, bot });
  } catch (err) {
    logger.error('Erro ao criar bot', { error: err });
    res.status(500).json({ error: err.message });
  }
});

// POST /bots/import/local - import a bot from uploaded files
const importLocalSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
});

router.post('/import/local', upload.array('files'), validate({ body: importLocalSchema }), async (req, res) => {
  try {
    const { files } = req;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'Nenhum arquivo recebido' });
    }
    
    const { fileNames, dependencies, entryPoint } = await scanLocalFiles(files);
    const newName = req.body.name || path.parse(fileNames[0]).name;
    const description = req.body.description || null;
    
    // Cria registro no repositório
    const data = await botsRepo.insert({
      name: newName,
      session_name: null,
      qrcode: null,
      is_active: false,
      description,
    });
    
    // Build response with scanning details
    res.json({
      bot: data,
      scan: {
        files: fileNames,
        dependencies,
        entryPoint,
      },
    });
  } catch (err) {
    logger.error('Erro ao importar bot local:', err);
    res.status(500).json({ error: err.message });
  } finally {
    // Remove uploaded temp files
    if (req.files) {
      req.files.forEach((f) => {
        fs.unlink(f.path, () => {});
      });
    }
  }
});

// POST /bots/import/remote - import a bot from a remote repository
const importRemoteSchema = z.object({
  url: z.string().min(1, 'URL do repositório é obrigatória').refine(isValidUrl, 'URL inválida'),
  name: z.string().optional(),
  description: z.string().optional(),
});

router.post('/import/remote', express.json(), validate({ body: importRemoteSchema }), async (req, res) => {
  const { url, name, description } = req.body;
  
  try {
    logger.info('Iniciando importação remota:', { url });
    
    const { fileNames, dependencies, entryPoint, directUrl } = await scanRemoteRepo(url);
    const botName = name || (directUrl ? path.basename(url) : url.split('/').pop());
    
    // Cria registro no repositório
    const data = await botsRepo.insert({
      name: botName,
      session_name: null,
      qrcode: null,
      is_active: false,
      description: description || url,
    });
    
    logger.info('Bot importado com sucesso:', { botId: data.id, files: fileNames.length });
    
    res.json({
      bot: data,
      scan: { 
        files: fileNames, 
        dependencies, 
        entryPoint,
        source: directUrl ? 'direct' : 'repository'
      },
    });
  } catch (err) {
    logger.error('Erro ao importar bot remoto:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /bots/import/folder - import a bot from folder/archive with multiple files
const importFolderSchema = z.object({
  botConfig: z.string().optional(), // JSON string with bot configuration
  selectedFiles: z.string().optional(), // JSON string with selected files info
});

router.post('/import/folder', upload.array('files'), validate({ body: importFolderSchema }), async (req, res) => {
  try {
    let botConfig = {
      name: 'Bot Importado',
      description: 'Bot importado de pasta/arquivo',
      type: 'whatsapp',
      version: '1.0.0'
    };
    
    let selectedFiles = [];

    // Parse do botConfig se fornecido
    if (req.body.botConfig) {
      try {
        botConfig = JSON.parse(req.body.botConfig);
      } catch (e) {
        console.warn('Erro ao parsear botConfig, usando padrão:', e);
      }
    }

    // Parse dos selectedFiles se fornecido
    if (req.body.selectedFiles) {
      try {
        selectedFiles = JSON.parse(req.body.selectedFiles);
      } catch (e) {
        console.warn('Erro ao parsear selectedFiles:', e);
      }
    }

    // Analizar arquivos enviados
    const { fileNames, dependencies, entryPoint } = await scanLocalFiles(req.files || []);

    // Criar registro no repositório
    const data = await botsRepo.insert({
      name: botConfig.name,
      session_name: botConfig.name.toLowerCase().replace(/\s+/g, '_'),
      qrcode: null,
      is_active: false,
      description: botConfig.description,
    });

    res.json({
      success: true,
      bot: data,
      scan: { 
        files: fileNames, 
        dependencies, 
        entryPoint,
        selectedFiles: selectedFiles.length > 0 ? selectedFiles : fileNames,
        config: botConfig
      },
    });

  } catch (err) {
    console.error('Erro ao importar pasta/arquivo:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /bots/extract-archive - extract compressed files (RAR, 7Z, TAR)
router.post('/extract-archive', upload.single('archive'), async (req, res) => {
  try {
    const archiveFile = req.file;
    if (!archiveFile) {
      return res.status(400).json({ error: 'Nenhum arquivo compactado enviado' });
    }

    // Por enquanto, retornar erro indicando que apenas ZIP é suportado nativamente
    // Em uma implementação completa, aqui seria feita a extração usando bibliotecas específicas
    res.status(501).json({ 
      error: 'Extração de arquivos RAR, 7Z e TAR ainda não implementada no servidor. Use arquivos ZIP para extração automática.',
      supportedFormats: ['zip']
    });

  } catch (err) {
    console.error('Erro ao extrair arquivo:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /bots/:id/start - inicia uma sessão para o bot especificado
// Exemplo para PUT (atualização de bot)
router.put('/:id', upload.none(), validate({ body: createBotSchema }), async (req, res) => {
  try {
    const botId = req.params.id;
    const oldBot = await botsRepo.findById(botId);
    const updatedBot = await botsRepo.update(botId, req.body);
    await logAudit({ req, action: 'update', resourceType: 'bot', resourceId: botId, oldValues: oldBot, newValues: updatedBot });
    res.json({ success: true, bot: updatedBot });
  } catch (err) {
    logger.error('Erro ao atualizar bot', { error: err });
    res.status(500).json({ error: err.message });
  }
});

// Exemplo para DELETE (remoção de bot)
router.delete('/:id', async (req, res) => {
  try {
    const botId = req.params.id;
    console.log('🗑️ [DELETE] Iniciando remoção do bot:', botId);
    
    console.log('[DELETE] Buscando bot...');
    const oldBot = await botsRepo.findById(botId);
    console.log('[DELETE] Bot encontrado:', oldBot?.name);
    
    console.log('[DELETE] Removendo bot...');
    const result = await botsRepo.remove(botId);
    console.log('[DELETE] Bot removido:', result);
    
    console.log('[DELETE] Registrando auditoria...');
    await logAudit({ req, action: 'delete', resourceType: 'bot', resourceId: botId, oldValues: oldBot });
    console.log('[DELETE] Auditoria registrada');
    
    console.log('[DELETE] Sucesso total!');
    res.json({ success: true });
    
    // // Código original que trava:
    // console.log('� [DELETE] Buscando bot...');
    // const oldBot = await botsRepo.findById(botId);
    // console.log('✅ [DELETE] Bot encontrado:', oldBot?.name);
    
    // console.log('� [DELETE] Removendo bot...');
    // const result = await botsRepo.remove(botId);
    // console.log('✅ [DELETE] Bot removido:', result);
    
  } catch (err) {
    console.error('❌ [DELETE] Erro:', err);
    logger.error('Erro ao remover bot', { error: err });
    res.status(500).json({ error: err.message });
  }
});

const idParamSchema = z.object({ id: z.string() });

router.post('/:id/start', validate({ params: idParamSchema }), async (req, res) => {
  const { id } = req.params;
  const logger = require('../logger.cjs');
  logger.info(`[START BOT] Requisição recebida para iniciar bot: ${id}`);
  try {
    // Recupera o bot para obter session_name
    const botData = await botsRepo.findById(id);
    logger.info(`[START BOT] Dados do bot encontrados: ${JSON.stringify(botData)}`);
    if (!botData) {
      logger.error(`[START BOT] Bot não encontrado: ${id}`);
      throw new Error('Bot não encontrado');
    }
    const qrCode = await startSession({ id: botData.id, session_name: botData.session_name });
    logger.info(`[START BOT] Sessão iniciada com sucesso para bot: ${id}`);
    res.json({ message: 'Sessão iniciada', qrcode: qrCode });
  } catch (err) {
    logger.error(`[START BOT] Erro ao iniciar sessão para bot ${id}:`, err);
    res.status(500).json({ error: 'Erro ao iniciar sessão', details: err.message });
  }
});

// POST /bots/:id/stop - encerra a sessão do bot

router.post('/:id/stop', validate({ params: idParamSchema }), async (req, res) => {
  const { id } = req.params;
  try {
    await stopSession(id);
    res.json({ message: 'Sessão encerrada' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao encerrar sessão', details: err.message });
  }
});

// GET /bots/:id/status - verifica o status da sessão (ativa ou não)

router.get('/:id/status', validate({ params: idParamSchema }), async (req, res) => {
  const { id } = req.params;
  // status calculado pela memória + PostgreSQL
  const active = isSessionActive(id);
  res.json({ active });
});

// GET /bots/:id/qrcode - retorna o QR code atual do bot, se existir

router.get('/:id/qrcode', validate({ params: idParamSchema }), async (req, res) => {
  const { id } = req.params;
  // Tenta recuperar QR code da memória primeiro
  let qr = getQrcode(id);
  if (!qr) {
    // Fallback: busca no repositório
    try {
      const botData = await botsRepo.findQrcodeById(id);
      if (!botData) {
        return res.status(404).json({ error: 'QR code não disponível' });
      }
      qr = botData.qrcode;
    } catch (error) {
      console.error('Erro ao buscar QR code do repositório:', error);
      return res.status(404).json({ error: 'QR code não disponível' });
    }
  }
  if (!qr) return res.status(404).json({ error: 'QR code não disponível' });
  res.json({ qrcode: qr });
});

// GET /bots/:id/logs - retorna logs do bot

router.get('/:id/logs', validate({ params: idParamSchema }), async (req, res) => {
  const { id } = req.params;
  // Recupera logs em memória
  const memLogs = getLogs(id) || [];
  try {
    // Recupera logs persistidos no repositório
    const data = await botLogsRepo.listByBotId(id, 100);
    // Concatena logs do repositório (mais recentes) com os da memória
    const combined = [...data.map((l) => ({ timestamp: l.timestamp, direction: l.direction, message: l.message, type: l.type })), ...memLogs];
    res.json({ logs: combined });
  } catch (error) {
    console.error('Erro ao recuperar logs do repositório:', error);
    res.json({ logs: memLogs });
  }
});

// DELETE /bots/:id - Remove um bot e encerra sua sessão se ativa

router.delete('/:id', validate({ params: idParamSchema }), async (req, res) => {
  const { id } = req.params;
  try {
    // Finaliza sessão se estiver ativa
    if (isSessionActive(id)) {
      await stopSession(id);
    }
    // Remove bot do repositório
    await botsRepo.remove(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
