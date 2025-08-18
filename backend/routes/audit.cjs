
const express = require('express');
const { z } = require('zod');
const validate = require('../middleware/validate.cjs');
const router = express.Router();
const auditLogsRepo = require('../repositories/auditLogsRepository.cjs');
const authenticateJWT = require('../middleware/authenticateJWT.cjs');
const authorizeRole = require('../middleware/authorizeRole.cjs');

// Filtro avançado: múltiplos usuários, ações, datas, rota

// Esquema de validação para filtros de logs
const logsQuerySchema = z.object({
  user_ids: z.string().optional(),
  actions: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  route: z.string().optional(),
});

router.get('/logs', authenticateJWT, authorizeRole(['admin']), validate({ query: logsQuerySchema }), async (req, res) => {
  try {
    const { user_ids, actions, from, to, route } = req.query;
    const filters = {
      user_id: user_ids,
      action: actions,
      date_from: from,
      date_to: to,
      route,
    };
    const data = await auditLogsRepo.listAll(filters);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Relatório resumido por período

const summaryQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
});

router.get('/report/summary', authenticateJWT, authorizeRole(['admin']), validate({ query: summaryQuerySchema }), async (req, res) => {
  try {
    const { from, to } = req.query;
    const filters = { date_from: from, date_to: to };
    const data = await auditLogsRepo.listAll(filters);
    // Resumo
    const total = data.length;
    const uniqueUsers = [...new Set(data.map(d => d.user_id))].length;
    const actionsCount = {};
    data.forEach(d => { actionsCount[d.action] = (actionsCount[d.action] || 0) + 1; });
    res.json({ success: true, total, uniqueUsers, actionsCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Exportação filtrada

const exportQuerySchema = z.object({
  user_ids: z.string().optional(),
  actions: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  route: z.string().optional(),
  format: z.string().optional().default('json'),
});

router.get('/export', authenticateJWT, authorizeRole(['admin']), validate({ query: exportQuerySchema }), async (req, res) => {
  try {
    const { user_ids, actions, from, to, route, format = 'json' } = req.query;
    const filters = {
      user_id: user_ids,
      action: actions,
      date_from: from,
      date_to: to,
      route,
    };
    const data = await auditLogsRepo.listAll(filters);
    if (format === 'csv') {
      const csv = [Object.keys(data[0]).join(','), ...data.map(row => Object.values(row).join(','))].join('\n');
      res.header('Content-Type', 'text/csv');
      res.attachment('audit_logs.csv');
      return res.send(csv);
    }
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
