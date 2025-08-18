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
const supabase = require('../supabaseClient.cjs');

// GET /api/reports - Lista relatórios
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('reports').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /api/reports - Cria relatório
router.post('/', express.json(), async (req, res) => {
  const { data, error } = await supabase.from('reports').insert([req.body]).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// PUT /api/reports/:id - Atualiza relatório
router.put('/:id', express.json(), async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('reports').update(req.body).eq('id', id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// DELETE /api/reports/:id - Remove relatório
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('reports').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

module.exports = router;
