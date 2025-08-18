const logger = require('../logger.cjs');
const { logAudit } = require('../auditHelper.cjs');
// POST /api/monitoring - Cria registro de monitoramento
router.post('/', express.json(), async (req, res) => {
  try {
    const monitoring = await monitoringRepo.insert(req.body);
    await logAudit({ req, action: 'create', resourceType: 'monitoring', resourceId: monitoring.id, newValues: monitoring });
    res.json({ success: true, monitoring });
  } catch (error) {
    logger.error('Erro ao criar registro de monitoramento', { error });
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/monitoring/:id - Atualiza registro de monitoramento
router.put('/:id', express.json(), async (req, res) => {
  const { id } = req.params;
  try {
    const oldMonitoring = await monitoringRepo.getById(id);
    const updatedMonitoring = await monitoringRepo.update(id, req.body);
    await logAudit({ req, action: 'update', resourceType: 'monitoring', resourceId: id, oldValues: oldMonitoring, newValues: updatedMonitoring });
    res.json({ success: true, monitoring: updatedMonitoring });
  } catch (error) {
    logger.error('Erro ao atualizar registro de monitoramento', { error });
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/monitoring/:id - Remove registro de monitoramento
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const oldMonitoring = await monitoringRepo.getById(id);
    await monitoringRepo.delete(id);
    await logAudit({ req, action: 'delete', resourceType: 'monitoring', resourceId: id, oldValues: oldMonitoring });
    res.json({ success: true });
  } catch (error) {
    logger.error('Erro ao remover registro de monitoramento', { error });
    res.status(500).json({ error: error.message });
  }
});
const express = require('express');
const router = express.Router();
const monitoringRepo = require('../repositories/monitoringRepository.cjs');

// GET /api/monitoring - Lista dados de monitoramento
router.get('/', async (req, res) => {
  try {
    const data = await monitoringRepo.listAll();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/monitoring - Cria registro de monitoramento
router.post('/', express.json(), async (req, res) => {
  try {
    const data = await monitoringRepo.insert(req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/monitoring/:id - Atualiza registro
router.put('/:id', express.json(), async (req, res) => {
  const { id } = req.params;
  try {
    const data = await monitoringRepo.update(id, req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/monitoring/:id - Remove registro
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await monitoringRepo.remove(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
