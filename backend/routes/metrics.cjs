const express = require('express');
const promClient = require('prom-client');
const os = require('os');
const logger = require('../logger.cjs');

// Cria um novo roteador
const metricsRouter = express.Router();

// Configuração do prom-client para Prometheus
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics(); // coleta métricas padrão do Node.js

// Métrica customizada: carga média de CPU (1 min)
const cpuLoadGauge = new promClient.Gauge({
  name: 'nodejs_cpu_load_avg_1m',
  help: 'Carga média de CPU de 1 minuto',
});

// Métrica customizada: uso de memória RSS
const memoryRssGauge = new promClient.Gauge({
  name: 'nodejs_process_memory_bytes',
  help: 'Uso de memória RSS do processo',
});

// Métrica customizada: uptime do processo
const uptimeGauge = new promClient.Gauge({
  name: 'nodejs_process_uptime_seconds',
  help: 'Tempo de atividade do processo em segundos',
});

// Métrica customizada: total de requisições HTTP
const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total de requisições HTTP',
  labelNames: ['method', 'route', 'status_code'],
});

// Métrica customizada: duração das requisições HTTP
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duração das requisições HTTP em segundos',
  labelNames: ['method', 'route'],
  buckets: [0.1, 0.5, 1, 2, 5],
});

// Métricas de aplicação
const activeUsers = new promClient.Gauge({
  name: 'app_active_users_total',
  help: 'Número total de usuários ativos',
});

const databaseConnections = new promClient.Gauge({
  name: 'app_database_connections_active',
  help: 'Número de conexões ativas com o banco de dados',
});

// GET /metrics - Endpoint Prometheus para coleta de métricas
metricsRouter.get('/', async (req, res) => {
  try {
    // Atualiza as métricas customizadas com valores atuais
    cpuLoadGauge.set(os.loadavg()[0]);
    memoryRssGauge.set(process.memoryUsage().rss);
    uptimeGauge.set(process.uptime());
    
    // Simula alguns valores para as métricas de aplicação
    activeUsers.set(Math.floor(Math.random() * 1000) + 500);
    databaseConnections.set(Math.floor(Math.random() * 10) + 5);
    
    // Define o content-type correto para Prometheus
    res.set('Content-Type', promClient.register.contentType);
    
    // Retorna todas as métricas no formato Prometheus
    const metrics = await promClient.register.metrics();
    res.end(metrics);
  } catch (error) {
    logger.error('Erro ao gerar métricas do Prometheus', { error });
    res.status(500).end('Erro interno do servidor');
  }
});

// Middleware para rastrear métricas HTTP (pode ser usado em outros lugares)
const trackHttpMetrics = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    
    httpRequestsTotal
      .labels(req.method, route, res.statusCode.toString())
      .inc();
    
    httpRequestDuration
      .labels(req.method, route)
      .observe(duration);
  });
  
  next();
};

module.exports = metricsRouter;
