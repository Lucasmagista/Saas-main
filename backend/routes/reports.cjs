const logger = require('../logger.cjs');
const { logAudit } = require('../auditHelper.cjs');
// POST /api/reports - Cria relatório
router.post('/', express.json(), async (req, res) => {
  try {
    const report = await reportsRepo.insert(req.body);
    await logAudit({ req, action: 'create', resourceType: 'report', resourceId: report.id, newValues: report });
    res.json({ success: true, report });
  } catch (error) {
    logger.error('Erro ao criar relatório', { error });
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/reports/:id - Atualiza relatório
router.put('/:id', express.json(), async (req, res) => {
  const { id } = req.params;
  try {
    const oldReport = await reportsRepo.getById(id);
    const updatedReport = await reportsRepo.update(id, req.body);
    await logAudit({ req, action: 'update', resourceType: 'report', resourceId: id, oldValues: oldReport, newValues: updatedReport });
    res.json({ success: true, report: updatedReport });
  } catch (error) {
    logger.error('Erro ao atualizar relatório', { error });
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/reports/:id - Remove relatório
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const oldReport = await reportsRepo.getById(id);
    await reportsRepo.delete(id);
    await logAudit({ req, action: 'delete', resourceType: 'report', resourceId: id, oldValues: oldReport });
    res.json({ success: true });
  } catch (error) {
    logger.error('Erro ao remover relatório', { error });
    res.status(500).json({ error: error.message });
  }
});
const express = require('express');
const router = express.Router();
const db = require('../postgresClient.cjs');

// GET /api/reports - Lista relatórios
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM reports ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/reports - Cria relatório
router.post('/', express.json(), async (req, res) => {
  try {
    const keys = Object.keys(req.body);
    const values = Object.values(req.body);
    const params = keys.map((_, i) => `$${i + 1}`).join(', ');
    const query = `INSERT INTO reports (${keys.join(',')}) VALUES (${params}) RETURNING *`;
    const result = await db.query(query, values);
    res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/reports/:id - Atualiza relatório
router.put('/:id', express.json(), async (req, res) => {
  const { id } = req.params;
  try {
    const keys = Object.keys(req.body);
    const values = Object.values(req.body);
    const setString = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const query = `UPDATE reports SET ${setString} WHERE id = $${keys.length + 1} RETURNING *`;
    const result = await db.query(query, [...values, id]);
    res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /api/reports/:id - Remove relatório
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM reports WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
