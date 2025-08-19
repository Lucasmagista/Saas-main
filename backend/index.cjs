/*
 * Servidor backend para integração com o WPPConnect.
 *
 * Este módulo inicializa um servidor Express responsável por
 * disponibilizar a API que irá interagir com o cliente de
 * WhatsApp. Além das rotas HTTP, também configura um servidor
 * WebSocket via Socket.IO para envio de mensagens em tempo real
 * ao frontend. Caso o pacote wppconnect não esteja instalado no
 * ambiente, são utilizados stubs simples para simular o envio e
 * recebimento de mensagens.
 */
const express = require('express');
const path = require('path');
// Importa configuração centralizada e valida variáveis de ambiente
const config = require('./config.cjs');
const http = require('http');
const cors = require('cors');
const corsMiddleware = require('./middleware/cors.cjs');
const whatsappRoutes = require('./routes/whatsapp.cjs');
const botsRoutes = require('./routes/bots.cjs');
const multisessionsRoutes = require('./routes/multisessions.cjs');
const setupSocket = require('./socket.cjs');
const authenticateJWT = require('./middleware/authenticateJWT.cjs');
const authorizePermission = require('./middleware/authorizePermission.cjs');
const authorizeRole = require('./middleware/authorizeRole.cjs');
const rateLimit = require('express-rate-limit');
// Removido Supabase: usamos apenas PostgreSQL local via postgresClient

// Logger estruturado
const logger = require('./logger.cjs');

// Cliente PostgreSQL
const postgresClient = require('./postgresClient.cjs');

const app = express();

// Função para inicializar o servidor
async function initializeServer() {
  try {
    // Testar conexão com banco de dados
    logger.info('Testando conexão com banco de dados...');
    const dbConnected = await postgresClient.testConnection();
    
    if (!dbConnected) {
      throw new Error('Falha ao conectar com banco de dados PostgreSQL');
    }
    
    logger.info('✅ Conexão com banco de dados estabelecida');
    
    // Aplica middleware CORS personalizado primeiro
    app.use(corsMiddleware);

    // Configuração adicional do CORS com a biblioteca cors
    const corsOptions = {
      origin: function (origin, callback) {
        const allowedOrigins = config.allowedOrigins;
        
        // Permite requisições sem origem (ex: mobile apps, Postman)
        if (!origin) return callback(null, true);
        
        // Em desenvolvimento, permite qualquer origem
        if (config.nodeEnv === 'development') {
          return callback(null, true);
        }
        
        if (allowedOrigins === true || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          logger.warn('Origem bloqueada pelo CORS:', { origin, allowedOrigins });
          callback(new Error('Não permitido pelo CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: [
        'Origin',
        'X-Requested-With', 
        'Content-Type',
        'Accept',
        'Authorization',
        'Cache-Control',
        'Pragma',
        'X-CSRF-Token'
      ],
      exposedHeaders: ['Authorization', 'X-Total-Count'],
      optionsSuccessStatus: 200
    };

    app.use(cors(corsOptions));

    // Middleware adicional para preflight requests
    app.options('*', cors(corsOptions));

    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Middleware de segurança + logging
    const { securityHeaders } = require('./middleware/securityHeaders.cjs');
    app.use(securityHeaders);
    app.use((req, res, next) => {
      logger.info(`${req.method} ${req.url}`, { 
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });
      next();
    });

    // Supabase removido: nenhuma inicialização necessária aqui

    // Limite de taxa para rotas sensíveis
    const limiter = rateLimit({
      windowMs: config.rateLimitWindowMs,
      max: config.rateLimitMax,
      message: { success: false, error: 'Limite de requisições excedido' },
      standardHeaders: true,
      legacyHeaders: false,
    });
    app.use(limiter);

    // Limite específico para rota de autenticação
    const authLimiter = rateLimit({
      windowMs: config.rateLimitWindowMs,
      max: config.authRateLimitMax,
      message: { success: false, error: 'Muitas tentativas de login. Tente novamente mais tarde.' },
    });

    // Limite específico para operações de bots
    const botsLimiter = rateLimit({
      windowMs: config.rateLimitWindowMs,
      max: 200,
      message: { success: false, error: 'Limite de operações de bot excedido' },
    });

    // Middleware global para capturar o usuário após autenticação
    app.use((req, res, next) => {
      // Intercepta a resposta para logar com o usuário correto
      const originalSend = res.send;
      res.send = function(data) {
        // Loga apenas uma vez por requisição
        if (!res.headersSent) {
          const userId = req.user?.id || req.user?.email || 'anon';
          logger.info(`${req.method} ${req.url}`, { 
            user: userId,
            status: res.statusCode,
            responseTime: Date.now() - req._startTime
          });
        }
        originalSend.call(this, data);
      };
      
      // Marca o tempo de início da requisição
      req._startTime = Date.now();
      
      next();
    });

    // Helper de auditoria
    const { logAudit } = require('./auditHelper.cjs');

    // Middleware global para registrar auditoria em métodos críticos
    app.use(async (req, res, next) => {
      if (["POST", "PUT", "DELETE"].includes(req.method)) {
        try {
          await logAudit({ 
            req, 
            action: req.method, 
            resourceType: req.baseUrl, 
            resourceId: req.body?.id, 
            newValues: req.body 
          });
        } catch (error) {
          logger.warn('Erro na auditoria global, mas continuando operação', { error: error.message });
        }
      }
      next();
    });

    // Rotas da API do WhatsApp (protegidas por JWT)
    app.use('/api/whatsapp', authenticateJWT, whatsappRoutes);
    
    // Rotas da API de bots (protegidas por JWT e com rate limit específico)
    app.use('/api/bots', botsLimiter, authenticateJWT, botsRoutes);
    
    // Rotas de usuário
    app.use('/api/user', require('./routes/user.cjs'));
    app.use('/api/customers', require('./routes/customers.cjs'));

    // Rotas protegidas por JWT
    app.use('/api/billing', authenticateJWT, require('./routes/billing.cjs'));
    app.use('/api/team', authenticateJWT, require('./routes/team.cjs'));
    app.use('/api/projects', authenticateJWT, require('./routes/projects.cjs'));
    app.use('/api/notifications', authenticateJWT, require('./routes/notifications.cjs'));
    app.use('/api/settings', authenticateJWT, require('./routes/settings.cjs'));
    app.use('/api/auth', authLimiter, require('./routes/auth.cjs'));
    app.use('/api/reports', authenticateJWT, authorizePermission(['canViewReports']));
    app.use('/api/integrations', authenticateJWT, require('./routes/integrations.cjs'));
    app.use('/api/automation', authenticateJWT);
    app.use('/api/marketplace', authenticateJWT);
    app.use('/api/monitoring', authenticateJWT);
    app.use('/api/security', authenticateJWT);
    app.use('/api/templates', authenticateJWT);
    app.use('/api/support', authenticateJWT);
    
    // Multi-sessions API
    app.use('/api/multisessions', botsLimiter, authenticateJWT, multisessionsRoutes);
    app.use('/api/communication', authenticateJWT);
    app.use('/api/billing', authenticateJWT);
    app.use('/api/files', require('./routes/files.cjs'));
    app.use('/uploads', express.static(require('path').join(__dirname, '../uploads')));

    // Rotas de IA
    const aiApi = require('./api/ai/index.cjs');
    app.use('/api/ai', aiApi);

    // Painel de gestão de usuários (admin/manager)
    app.use('/api/users/list', authenticateJWT, authorizeRole(['admin', 'manager']));
    app.use('/api/users/permissions', authenticateJWT, authorizeRole(['admin']));

    // Relatórios (admin, manager, permissão)
    app.use('/api/reports', authenticateJWT, authorizeRole(['admin', 'manager']), authorizePermission(['canViewReports']));

    // Upload de arquivos (user, manager, admin)
    app.use('/api/files/upload', authenticateJWT, authorizeRole(['admin', 'manager', 'user']), authorizePermission(['canUploadFiles']));

    // Rota de auditoria
    app.use('/api/audit', require('./routes/audit.cjs'));

    // Servir arquivos estáticos da pasta public
    app.use(express.static(path.join(__dirname, '../public')));
    
    // Importar rotas auxiliares (settings, logo e avatar)
    try {
      const settingsApi = require('../src/server/api/settings');
      const logoApi = require('../src/server/api/logo');
      const avatarApi = require('../src/server/api/avatar');
      app.use('/api/settings', settingsApi);
      app.use('/api/logo', logoApi);
      app.use('/api/avatar', avatarApi);
    } catch (e) {
      logger.warn('Rotas adicionais de settings/logo/avatar não estão disponíveis', { error: e.message });
    }

    // Rotas de saúde e métricas
    try {
      const healthRoutes = require('./routes/health.cjs');
      app.use('/', healthRoutes);
    } catch (e) {
      logger.warn('Rotas de saúde não disponíveis', { error: e.message });
    }

    // Notificações
    try {
      const notificationsRoutes = require('./routes/notifications.cjs');
      app.use('/api/notifications', authenticateJWT, notificationsRoutes);
    } catch (e) {
      logger.warn('Rotas de notificações não disponíveis', { error: e.message });
    }

    // E-mail
    try {
      const emailRoutes = require('./routes/email.cjs');
      app.use('/api/email', authenticateJWT, emailRoutes);
    } catch (e) {
      logger.warn('Rotas de e-mail não disponíveis', { error: e.message });
    }

    // WhatsApp Webhook (não requer autenticação pois é chamada interna)
    try {
      const whatsappWebhook = require('./routes/whatsappWebhook.cjs');
      app.use('/api/whatsapp/webhook', whatsappWebhook);
    } catch (e) {
      logger.warn('Webhook de WhatsApp não disponível', { error: e.message });
    }

    // Analytics
    try {
      const analyticsRoutes = require('./routes/analytics.cjs');
      app.use('/api/analytics', analyticsRoutes);
      logger.info('Rotas de analytics carregadas com sucesso');
    } catch (e) {
      logger.warn('Rotas de analytics não disponíveis', { error: e.message });
    }

    // Métricas Prometheus
    try {
      const metricsRoutes = require('./routes/metrics.cjs');
      app.use('/metrics', metricsRoutes);
    } catch (e) {
      logger.warn('Rotas de métricas não disponíveis', { error: e.message });
    }

    // Middleware de tratamento de erro global
    app.use((err, req, res, next) => {
      logger.error('Erro não tratado:', {
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip
      });

      // Não expor detalhes do erro em produção
      const isDevelopment = config.nodeEnv === 'development';
      
      res.status(err.status || 500).json({
        success: false,
        error: isDevelopment ? err.message : 'Erro interno do servidor',
        ...(isDevelopment && { stack: err.stack })
      });
    });

    // Middleware para rotas não encontradas
    app.use('*', (req, res) => {
      logger.warn('Rota não encontrada:', { 
        url: req.originalUrl, 
        method: req.method,
        ip: req.ip 
      });
      
      res.status(404).json({
        success: false,
        error: 'Rota não encontrada',
        path: req.originalUrl
      });
    });

    logger.info('✅ Servidor inicializado com sucesso');
    
  } catch (error) {
    logger.error('❌ Erro ao inicializar servidor:', error);
    process.exit(1);
  }
}

// Inicializar servidor
initializeServer();

// Exporta o app para uso em testes e inicialização separada
module.exports = app;
