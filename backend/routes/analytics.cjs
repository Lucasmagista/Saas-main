const express = require('express');
const router = express.Router();
const logger = require('../logger.cjs');
const { logAudit } = require('../auditHelper.cjs');
const authenticateJWT = require('../middleware/authenticateJWT.cjs');
const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// Função para verificar status do banco de dados
async function checkDatabaseHealth() {
  try {
    const db = require('../postgresClient.cjs');
    const startTime = Date.now();
    await db.query('SELECT 1');
    const queryTime = Date.now() - startTime;
    return {
      status: 'online',
      connections: 0,
      maxConnections: 0,
      queryTime,
      storage: 0
    };
  } catch (error) {
    logger.error('Erro ao verificar saúde do banco de dados:', error);
    return {
      status: 'offline',
      connections: 0,
      maxConnections: 0,
      queryTime: 0,
      storage: 0,
      error: error.message
    };
  }
}

// Função para obter métricas de WebSocket
function getWebSocketMetrics() {
  try {
    // Se você estiver usando socket.io, pode acessar as métricas assim:
    const socketIO = require('../socket.cjs');
    
    if (socketIO && socketIO.engine) {
      return {
        status: 'online',
        activeConnections: socketIO.engine.clientsCount || 0,
        messageRate: 0, // Implementar contador de mensagens
        latency: 0 // Implementar medição de latência
      };
    }
    
    return {
      status: 'offline',
      activeConnections: 0,
      messageRate: 0,
      latency: 0
    };
  } catch (error) {
    logger.error('Erro ao obter métricas de WebSocket:', error);
    return {
      status: 'offline',
      activeConnections: 0,
      messageRate: 0,
      latency: 0
    };
  }
}

// Função para verificar APIs externas
async function checkExternalAPIs() {
  const apis = [
    {
      name: 'WhatsApp Business API',
      url: 'https://graph.facebook.com/v17.0/me',
      headers: { 'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN || ''}` }
    },
    {
      name: 'OpenAI API',
      url: 'https://api.openai.com/v1/models',
      headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY || ''}` }
    },
    {
      name: 'Telegram Bot API',
      url: `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN || 'test'}/getMe`
    }
  ];

  const results = [];

  for (const api of apis) {
    try {
      if (!api.headers?.Authorization?.includes('undefined') && api.headers?.Authorization?.split(' ')[1]) {
        const startTime = Date.now();
        const response = await fetch(api.url, {
          method: 'GET',
          headers: api.headers || {},
          timeout: 5000
        });
        const latency = Date.now() - startTime;

        results.push({
          name: api.name,
          status: response.ok ? 'online' : 'degraded',
          latency,
          statusCode: response.status
        });
      } else {
        results.push({
          name: api.name,
          status: 'offline',
          latency: 0,
          error: 'Token não configurado'
        });
      }
    } catch (error) {
      results.push({
        name: api.name,
        status: 'offline',
        latency: 0,
        error: error.message
      });
    }
  }

  return results;
}

// Função para obter uso de disco
function getDiskUsage() {
  try {
    if (process.platform === 'win32') {
      // Windows - usando PowerShell ao invés de wmic
      const output = execSync('powershell "Get-WmiObject -Class Win32_LogicalDisk | Select-Object Size,FreeSpace | ConvertTo-Json"', { encoding: 'utf8' });
      const diskData = JSON.parse(output);
      
      let totalSize = 0;
      let freeSpace = 0;
      
      // Se for um único disco, converte para array
      const disks = Array.isArray(diskData) ? diskData : [diskData];
      
      for (const disk of disks) {
        if (disk.Size && disk.FreeSpace) {
          totalSize += parseInt(disk.Size);
          freeSpace += parseInt(disk.FreeSpace);
        }
      }
      
      return totalSize > 0 ? Math.round(((totalSize - freeSpace) / totalSize) * 100) : 0;
    } else {
      // Linux/Mac
      const output = execSync('df -h /', { encoding: 'utf8' });
      const line = output.split('\n')[1];
      const usage = line.split(/\s+/)[4];
      return parseInt(usage.replace('%', ''));
    }
  } catch (error) {
    logger.error('Erro ao obter uso de disco:', error);
    return 0;
  }
}

// Função para obter uso de rede
function getNetworkUsage() {
  try {
    if (process.platform === 'win32') {
      // Windows - implementação básica
      return Math.floor(Math.random() * 20); // Placeholder - requer implementação específica
    } else {
      // Linux - usar /proc/net/dev
      try {
        execSync('cat /proc/net/dev', { encoding: 'utf8' });
        // Implementação básica - requer parsing completo
        return Math.floor(Math.random() * 20); // Placeholder
      } catch (cmdError) {
        logger.warn('Comando cat não disponível:', cmdError.message);
        return 0;
      }
    }
  } catch (error) {
    logger.error('Erro ao obter uso de rede:', error);
    return 0;
  }
}

// Função para obter eventos recentes dos logs
async function getRecentEvents(limit = 10) {
  try {
    const logsDir = path.join(__dirname, '../logs');
    const today = new Date().toISOString().split('T')[0];
    const logFile = path.join(logsDir, `app-${today}.log`);
    
    try {
      const logContent = await fs.readFile(logFile, 'utf8');
      const lines = logContent.split('\n').filter(line => line.trim());
      
      return parseLogLines(lines.slice(-limit * 3).reverse(), limit);
    } catch (fileError) {
      logger.warn('Arquivo de log não encontrado:', fileError.message);
      return getDefaultEvents();
    }
  } catch (error) {
    logger.error('Erro ao obter eventos recentes:', error);
    return [];
  }
}

// Função auxiliar para parsing das linhas de log
function parseLogLines(lines, limit) {
  const events = [];
  
  for (const line of lines) {
    if (events.length >= limit) break;
    
    try {
      const logEntry = JSON.parse(line);
      if (logEntry.timestamp && logEntry.message) {
        events.push(createEventFromLog(logEntry));
      }
    } catch (parseError) {
      logger.debug('Linha de log não é JSON válido:', parseError.message);
      // Continue processando outras linhas
    }
  }
  
  return events;
}

// Função auxiliar para criar evento a partir do log
function createEventFromLog(logEntry) {
  const time = new Date(logEntry.timestamp).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  let type = 'info';
  if (logEntry.level === 'error') type = 'error';
  else if (logEntry.level === 'warn') type = 'warning';
  else if (logEntry.message.includes('sucesso') || logEntry.message.includes('conectado')) type = 'success';
  
  return {
    time,
    type,
    message: logEntry.message,
    level: logEntry.level
  };
}

// Função auxiliar para eventos padrão
function getDefaultEvents() {
  return [{
    time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    type: 'info',
    message: 'Sistema de logs inicializado'
  }];
}

// GET /api/analytics/dashboard - Dados gerais do dashboard
router.get('/dashboard', async (req, res) => {
  try {
    // Dados mockados para analytics do dashboard
    const dashboardData = {
      totalUsers: 1247,
      activeUsers: 892,
      totalRevenue: 84500.75,
      monthlyGrowth: 12.5,
      popularPages: [
        { page: '/dashboard', views: 15420, percentage: 28.3 },
        { page: '/customers', views: 9873, percentage: 18.1 },
        { page: '/reports', views: 7654, percentage: 14.0 },
        { page: '/settings', views: 5432, percentage: 9.9 }
      ],
      trafficSources: [
        { source: 'Direct', visits: 8234, percentage: 45.2 },
        { source: 'Search', visits: 4567, percentage: 25.1 },
        { source: 'Social', visits: 3210, percentage: 17.6 },
        { source: 'Referral', visits: 2198, percentage: 12.1 }
      ],
      userActivity: {
        today: 234,
        thisWeek: 1567,
        thisMonth: 6789,
        lastMonth: 5432
      }
    };

    res.json({ success: true, data: dashboardData });
  } catch (error) {
    logger.error('Erro ao obter analytics do dashboard', { error });
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/performance - Métricas de performance
router.get('/performance', async (req, res) => {
  try {
    const performanceData = {
      pageLoadTime: {
        average: 1.23,
        p95: 2.45,
        p99: 4.12
      },
      apiResponseTime: {
        average: 145,
        p95: 287,
        p99: 512
      },
      errorRate: 0.02,
      uptime: 99.97,
      throughput: 1250, // requests per minute
      memoryUsage: 68.5,
      cpuUsage: 23.1
    };

    res.json({ success: true, data: performanceData });
  } catch (error) {
    logger.error('Erro ao obter métricas de performance', { error });
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/users - Analytics de usuários
router.get('/users', async (req, res) => {
  try {
    const userAnalytics = {
      totalUsers: 1247,
      newUsers: {
        today: 23,
        thisWeek: 156,
        thisMonth: 678
      },
      userRetention: {
        day1: 85.2,
        day7: 62.1,
        day30: 34.7
      },
      userSegments: [
        { segment: 'Admin', count: 12, percentage: 1.0 },
        { segment: 'Manager', count: 89, percentage: 7.1 },
        { segment: 'User', count: 1023, percentage: 82.0 },
        { segment: 'Guest', count: 123, percentage: 9.9 }
      ],
      activeUsersByHour: [
        { hour: '00:00', users: 12 },
        { hour: '01:00', users: 8 },
        { hour: '02:00', users: 5 },
        { hour: '03:00', users: 3 },
        { hour: '04:00', users: 2 },
        { hour: '05:00', users: 4 },
        { hour: '06:00', users: 15 },
        { hour: '07:00', users: 45 },
        { hour: '08:00', users: 123 },
        { hour: '09:00', users: 187 },
        { hour: '10:00', users: 234 },
        { hour: '11:00', users: 298 },
        { hour: '12:00', users: 312 },
        { hour: '13:00', users: 287 },
        { hour: '14:00', users: 256 },
        { hour: '15:00', users: 223 },
        { hour: '16:00', users: 198 },
        { hour: '17:00', users: 167 },
        { hour: '18:00', users: 134 },
        { hour: '19:00', users: 98 },
        { hour: '20:00', users: 67 },
        { hour: '21:00', users: 45 },
        { hour: '22:00', users: 32 },
        { hour: '23:00', users: 18 }
      ]
    };

    res.json({ success: true, data: userAnalytics });
  } catch (error) {
    logger.error('Erro ao obter analytics de usuários', { error });
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/revenue - Analytics de receita
router.get('/revenue', async (req, res) => {
  try {
    const revenueAnalytics = {
      totalRevenue: 84500.75,
      monthlyRevenue: [
        { month: 'Jan', revenue: 65400.32 },
        { month: 'Fev', revenue: 72150.89 },
        { month: 'Mar', revenue: 78920.45 },
        { month: 'Abr', revenue: 84500.75 }
      ],
      revenueByPlan: [
        { plan: 'Basic', revenue: 12500.00, users: 250 },
        { plan: 'Pro', revenue: 45600.75, users: 152 },
        { plan: 'Enterprise', revenue: 26400.00, users: 24 }
      ],
      mrr: 21125.19, // Monthly Recurring Revenue
      arr: 253502.25, // Annual Recurring Revenue
      churnRate: 2.1,
      cac: 125.50, // Customer Acquisition Cost
      ltv: 2450.75 // Customer Lifetime Value
    };

    res.json({ success: true, data: revenueAnalytics });
  } catch (error) {
    logger.error('Erro ao obter analytics de receita', { error });
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/analytics/platforms
 * Retorna a distribuição de mensagens por plataforma nas últimas 24h
 */
router.get('/platforms', async (req, res) => {
  try {
    logger.info('Buscando distribuição de plataformas');

    // Dados mockados para demonstração (removendo autenticação temporariamente)
    const platformStats = [
      { name: 'WhatsApp', value: 65, color: '#25D366' },
      { name: 'Email', value: 25, color: '#EA4335' },
      { name: 'SMS', value: 10, color: '#1DA1F2' }
    ];

    res.json(platformStats);
  } catch (error) {
    logger.error('Erro ao buscar distribuição de plataformas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor ao buscar dados de plataformas'
    });
  }
});

/**
 * GET /api/analytics/response-times
 * Retorna dados de tempo de resposta por plataforma ao longo do dia
 */
router.get('/response-times', async (req, res) => {
  try {
    logger.info('Buscando dados de tempo de resposta');

    // Dados mockados para demonstração (removendo autenticação temporariamente)
    const responseTimeData = [
      { time: '00:00', whatsapp: 2.3, telegram: 1.8, discord: 3.1 },
      { time: '04:00', whatsapp: 2.1, telegram: 1.9, discord: 2.8 },
      { time: '08:00', whatsapp: 3.2, telegram: 2.4, discord: 4.1 },
      { time: '12:00', whatsapp: 4.1, telegram: 3.2, discord: 5.2 },
      { time: '16:00', whatsapp: 3.8, telegram: 2.9, discord: 4.8 },
      { time: '20:00', whatsapp: 2.9, telegram: 2.2, discord: 3.6 }
    ];

    res.json(responseTimeData);
  } catch (error) {
    logger.error('Erro ao buscar tempos de resposta:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor ao buscar tempos de resposta'
    });
  }
});

/**
 * GET /api/analytics/messages-over-time  
 * Retorna volume de mensagens por hora nas últimas 24h
 */
router.get('/messages-over-time', async (req, res) => {
  try {
    logger.info('Buscando volume de mensagens ao longo do tempo');

    // Dados mockados para demonstração (removendo autenticação temporariamente)
    const messageData = [];
    for (let i = 0; i < 24; i += 2) {
      const hour = i.toString().padStart(2, '0') + ':00';
      // Simula atividade baseada na hora do dia
      let messages = 10; // base
      if (i >= 8 && i <= 18) messages += 30; // horário comercial
      if (i >= 12 && i <= 14) messages += 20; // horário de almoço
      messages += Math.floor(Math.random() * 15); // variação
      
      messageData.push({ time: hour, messages });
    }

    res.json(messageData);
  } catch (error) {
    logger.error('Erro ao buscar mensagens ao longo do tempo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor ao buscar volume de mensagens'
    });
  }
});

/**
 * GET /api/analytics/real-time-metrics
 * Retorna métricas em tempo real para comparações percentuais
 */
router.get('/real-time-metrics', async (req, res) => {
  try {
    logger.info('Buscando métricas em tempo real');

    // Dados mockados para demonstração (removendo autenticação temporariamente)
    const result = {
      averageResponseTime: 2.8,
      responseTimeChange: -5.2,
      messagesGrowth: 12.3,
      conversationsGrowth: 8.7
    };

    res.json(result);
  } catch (error) {
    logger.error('Erro ao buscar métricas em tempo real:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor ao buscar métricas em tempo real'
    });
  }
});

// POST /api/analytics/track - Rastrear evento customizado
router.post('/track', express.json(), async (req, res) => {
  try {
    const { event, properties, userId } = req.body;
    
    // Log do evento para analytics
    logger.info('Analytics event tracked', {
      event,
      properties,
      userId,
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    await logAudit({ 
      req, 
      action: 'track_event', 
      resourceType: 'analytics', 
      resourceId: null,
      newValues: { event, properties, userId }
    });

    res.json({ success: true, message: 'Event tracked successfully' });
  } catch (error) {
    logger.error('Erro ao rastrear evento de analytics', { error });
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/active-users - Lista usuários ativos em conversas
router.get('/active-users', async (req, res) => {
  try {
    // Aqui você integraria com seu sistema real de conversas
    // Por enquanto, retorna uma estrutura vazia para dados reais
    const activeUsers = [];
    
    // Estatísticas calculadas baseadas nos dados reais
    const stats = {
      totalActiveUsers: activeUsers.length,
      activeChats: activeUsers.filter(u => u.status === 'active').length,
      averageChatDuration: 0,
      averageSatisfaction: 0
    };

    res.json({ 
      success: true, 
      data: {
        users: activeUsers,
        stats
      }
    });
  } catch (error) {
    logger.error('Erro ao obter usuários ativos', { error });
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/system-health - Métricas de saúde do sistema
router.get('/system-health', async (req, res) => {
  try {
    const os = require('os');
    
    // Métricas reais do servidor
    const cpuUsage = os.loadavg()[0] / os.cpus().length * 100;
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const memoryUsage = ((totalMemory - freeMemory) / totalMemory) * 100;
    const uptime = os.uptime();
    
    // Formata uptime para formato legível
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const uptimeFormatted = `${days}d ${hours}h ${minutes}m`;
    
    // Obter métricas de disco e rede
    const diskUsage = getDiskUsage();
    const networkUsage = getNetworkUsage();
    
    // Verificar saúde do banco de dados
    const databaseHealth = await checkDatabaseHealth();
    
    // Obter métricas do WebSocket
    const websocketMetrics = getWebSocketMetrics();
    
    // Verificar APIs externas
    const apiStatus = await checkExternalAPIs();
    
    // Obter eventos recentes
    const recentEvents = await getRecentEvents(10);
    
    const systemHealth = {
      server: {
        status: 'online',
        uptime: uptimeFormatted,
        cpu: Math.round(Math.max(0, Math.min(100, cpuUsage))), // Garante que está entre 0-100
        memory: Math.round(memoryUsage),
        disk: diskUsage,
        network: networkUsage
      },
      database: databaseHealth,
      websocket: websocketMetrics,
      apis: apiStatus,
      events: recentEvents
    };

    res.json({ 
      success: true, 
      data: systemHealth 
    });
  } catch (error) {
    logger.error('Erro ao obter métricas de saúde do sistema', { error });
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/api-config - Obter configuração das APIs externas
router.get('/api-config', authenticateJWT, async (req, res) => {
  try {
    const apiConfigs = [
      {
        name: 'WhatsApp Business API',
        enabled: !!process.env.WHATSAPP_ACCESS_TOKEN,
        configured: !!process.env.WHATSAPP_ACCESS_TOKEN,
        description: 'API para integração com WhatsApp Business'
      },
      {
        name: 'OpenAI API',
        enabled: !!process.env.OPENAI_API_KEY,
        configured: !!process.env.OPENAI_API_KEY,
        description: 'API para recursos de IA e chat'
      },
      {
        name: 'Telegram Bot API',
        enabled: !!process.env.TELEGRAM_BOT_TOKEN,
        configured: !!process.env.TELEGRAM_BOT_TOKEN,
        description: 'API para bot do Telegram'
      }
    ];

    res.json({ 
      success: true, 
      data: apiConfigs 
    });
  } catch (error) {
    logger.error('Erro ao obter configuração de APIs', { error });
    res.status(500).json({ error: error.message });
  }
});

// POST /api/analytics/test-api - Testar conectividade de uma API específica
router.post('/test-api', authenticateJWT, express.json(), async (req, res) => {
  try {
    const { apiName } = req.body;
    const testResult = await testSpecificAPI(apiName);

    await logAudit({ 
      req, 
      action: 'test_api', 
      resourceType: 'api', 
      resourceId: apiName,
      newValues: testResult
    });

    res.json({ 
      success: true, 
      data: testResult 
    });
  } catch (error) {
    logger.error('Erro ao testar API', { error });
    res.status(500).json({ error: error.message });
  }
});

// Função auxiliar para testar APIs específicas
async function testSpecificAPI(apiName) {
  const apiTests = {
    'WhatsApp Business API': () => testWhatsAppAPI(),
    'OpenAI API': () => testOpenAIAPI(),
    'Telegram Bot API': () => testTelegramAPI()
  };

  const testFunction = apiTests[apiName];
  if (!testFunction) {
    return { name: apiName, status: 'offline', latency: 0, error: 'API não encontrada' };
  }

  return await testFunction();
}

// Funções de teste para cada API
async function testWhatsAppAPI() {
  if (!process.env.WHATSAPP_ACCESS_TOKEN) {
    return { name: 'WhatsApp Business API', status: 'offline', latency: 0, error: 'Token não configurado' };
  }

  const startTime = Date.now();
  try {
    const response = await fetch('https://graph.facebook.com/v17.0/me', {
      headers: { 'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}` },
      timeout: 5000
    });
    return {
      name: 'WhatsApp Business API',
      status: response.ok ? 'online' : 'degraded',
      latency: Date.now() - startTime,
      statusCode: response.status
    };
  } catch (error) {
    return {
      name: 'WhatsApp Business API',
      status: 'offline',
      latency: Date.now() - startTime,
      error: error.message
    };
  }
}

async function testOpenAIAPI() {
  if (!process.env.OPENAI_API_KEY) {
    return { name: 'OpenAI API', status: 'offline', latency: 0, error: 'Token não configurado' };
  }

  const startTime = Date.now();
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
      timeout: 5000
    });
    return {
      name: 'OpenAI API',
      status: response.ok ? 'online' : 'degraded',
      latency: Date.now() - startTime,
      statusCode: response.status
    };
  } catch (error) {
    return {
      name: 'OpenAI API',
      status: 'offline',
      latency: Date.now() - startTime,
      error: error.message
    };
  }
}

async function testTelegramAPI() {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    return { name: 'Telegram Bot API', status: 'offline', latency: 0, error: 'Token não configurado' };
  }

  const startTime = Date.now();
  try {
    const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getMe`, {
      timeout: 5000
    });
    return {
      name: 'Telegram Bot API',
      status: response.ok ? 'online' : 'degraded',
      latency: Date.now() - startTime,
      statusCode: response.status
    };
  } catch (error) {
    return {
      name: 'Telegram Bot API',
      status: 'offline',
      latency: Date.now() - startTime,
      error: error.message
    };
  }
}

// GET /api/analytics/websocket-metrics - Métricas detalhadas do WebSocket
router.get('/websocket-metrics', authenticateJWT, async (req, res) => {
  try {
    const websocketMetrics = getWebSocketMetrics();
    
    // Adicionar métricas mais detalhadas se disponível
    const detailedMetrics = {
      ...websocketMetrics,
      roomsCount: 0, // Implementar contagem de salas
      averageConnectionTime: 0, // Implementar tempo médio de conexão
      messageStats: {
        sent: 0,
        received: 0,
        failed: 0
      },
      connectionsByPlatform: {
        web: 0,
        mobile: 0,
        desktop: 0
      }
    };

    res.json({ 
      success: true, 
      data: detailedMetrics 
    });
  } catch (error) {
    logger.error('Erro ao obter métricas de WebSocket', { error });
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
