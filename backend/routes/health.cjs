/*
 * Rotas de saúde e métricas para monitoramento da aplicação.
 * Estas rotas retornam informações básicas de saúde (healthcheck)
 * e métricas simples de uso de recursos. Podem ser expandidas
 * para incluir métricas personalizadas e integradas com
 * Prometheus no futuro.
 */

const express = require('express');
const { sessions } = require('../services/botManager.cjs');

const router = express.Router();

// Endpoint de saúde. Útil para readiness/liveness probes em orquestradores.
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Endpoint de métricas básicas. Retorna uso de memória, uptime e
// quantidade de sessões ativas em memória.
router.get('/metrics', (req, res) => {
  const memory = process.memoryUsage();
  const activeSessions = Object.keys(sessions).length;
  res.json({
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      rss: memory.rss,
      heapTotal: memory.heapTotal,
      heapUsed: memory.heapUsed,
      external: memory.external,
    },
    activeSessions,
  });
});

module.exports = router;
