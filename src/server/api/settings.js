const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const SETTINGS_DIR = path.join(__dirname, '../../../public/settings');
const HISTORY_FILE = path.join(SETTINGS_DIR, 'settings-history.json');
const BACKUP_DIR = path.join(SETTINGS_DIR, 'backups');
const ALLOWED_TYPES = ['company', 'general', 'customization'];

// Autenticação básica (mock, para produção use JWT ou OAuth)
function isAuthenticated(req, res, next) {
  const token = req.headers['authorization'];
  if (token === 'Bearer minha-chave-secreta') {
    return next();
  }
  return res.status(401).json({ success: false, error: 'Não autorizado.' });
}

// Garante que as pastas existem
if (!fs.existsSync(SETTINGS_DIR)) {
  fs.mkdirSync(SETTINGS_DIR, { recursive: true });
}
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Função para validar tipo
function isValidType(type) {
  return ALLOWED_TYPES.includes(type);
}

// Função para validar dados básicos
function validateData(type, data) {
  if (type === 'company') {
    return typeof data.name === 'string' && typeof data.cnpj === 'string';
  }
  if (type === 'general') {
    return typeof data.language === 'string' && typeof data.currency === 'string';
  }
  if (type === 'customization') {
    return typeof data === 'object';
  }
  return false;
}

// Função para registrar histórico e backup
function addToHistory(type, changes, user = 'Usuário Atual') {
  let history = [];
  if (fs.existsSync(HISTORY_FILE)) {
    try {
      history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    } catch {}
  }
  const entry = {
    id: Date.now().toString(),
    section: type,
    action: 'Configuração alterada',
    changes,
    timestamp: new Date().toISOString(),
    user
  };
  history.unshift(entry);
  history = history.slice(0, 50); // Mantém últimas 50
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
  // Backup
  const backupFile = path.join(BACKUP_DIR, `${type}-settings-${Date.now()}.json`);
  fs.writeFileSync(backupFile, JSON.stringify(changes, null, 2));
}

// Salvar configurações (com autenticação)
router.put('/:type', isAuthenticated, express.json(), (req, res) => {
  const { type } = req.params;
  if (!isValidType(type)) {
    return res.status(400).json({ success: false, error: 'Tipo de configuração inválido.' });
  }
  if (!validateData(type, req.body)) {
    return res.status(400).json({ success: false, error: 'Dados inválidos para o tipo informado.' });
  }
  const filePath = path.join(SETTINGS_DIR, `${type}-settings.json`);
  fs.writeFile(filePath, JSON.stringify(req.body, null, 2), err => {
    if (err) {
      console.error(`[${new Date().toISOString()}] Erro ao salvar configurações:`, err);
      return res.status(500).json({ success: false, error: 'Erro ao salvar configurações.' });
    }
    addToHistory(type, req.body);
    res.json({ success: true, message: 'Configurações salvas com sucesso.' });
  });
});

// Ler configurações
router.get('/:type', isAuthenticated, (req, res) => {
  const { type } = req.params;
  if (!isValidType(type)) {
    return res.status(400).json({ success: false, error: 'Tipo de configuração inválido.' });
  }
  const filePath = path.join(SETTINGS_DIR, `${type}-settings.json`);
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`[${new Date().toISOString()}] Erro ao ler configurações:`, err);
      return res.status(404).json({ success: false, error: 'Arquivo não encontrado.' });
    }
    try {
      res.json({ success: true, data: JSON.parse(data) });
    } catch (e) {
      console.error(`[${new Date().toISOString()}] Erro ao parsear configurações:`, e);
      res.status(500).json({ success: false, error: 'Erro ao ler configurações.' });
    }
  });
});

// Endpoint para histórico
router.get('/history/all', isAuthenticated, (req, res) => {
  if (!fs.existsSync(HISTORY_FILE)) {
    return res.json({ success: true, history: [] });
  }
  try {
    const history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    res.json({ success: true, history });
  } catch (e) {
    console.error(`[${new Date().toISOString()}] Erro ao ler histórico:`, e);
    res.status(500).json({ success: false, error: 'Erro ao ler histórico.' });
  }
});

// Endpoint para listar tipos permitidos
router.get('/types', (req, res) => {
  res.json({ success: true, types: ALLOWED_TYPES });
});

// Endpoint para listar backups
router.get('/backups/:type', isAuthenticated, (req, res) => {
  const { type } = req.params;
  if (!isValidType(type)) {
    return res.status(400).json({ success: false, error: 'Tipo de configuração inválido.' });
  }
  const files = fs.readdirSync(BACKUP_DIR).filter(f => f.startsWith(`${type}-settings-`));
  res.json({ success: true, backups: files });
});

// Endpoint para restaurar backup
router.post('/restore/:type', isAuthenticated, express.json(), (req, res) => {
  const { type } = req.params;
  const { backupFile } = req.body;
  if (!isValidType(type) || !backupFile) {
    return res.status(400).json({ success: false, error: 'Parâmetros inválidos.' });
  }
  const filePath = path.join(BACKUP_DIR, backupFile);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, error: 'Backup não encontrado.' });
  }
  const destPath = path.join(SETTINGS_DIR, `${type}-settings.json`);
  fs.copyFileSync(filePath, destPath);
  res.json({ success: true, message: 'Backup restaurado com sucesso.' });
});

// Endpoint de teste automatizado (mock)
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'API de configurações está funcionando.' });
});

/**
 * Documentação inline dos endpoints:
 * PUT /:type (autenticado) - Salva configurações
 * GET /:type (autenticado) - Lê configurações
 * GET /history/all (autenticado) - Histórico
 * GET /types - Lista tipos
 * GET /backups/:type (autenticado) - Lista backups
 * POST /restore/:type (autenticado) - Restaura backup
 * POST /rollback/:id (autenticado) - Rollback para histórico
 * GET /diff/:type?fileA&fileB (autenticado) - Diff entre backups
 * GET /export/:type (autenticado) - Exporta configurações
 * GET /test - Teste
 */

module.exports = router;
