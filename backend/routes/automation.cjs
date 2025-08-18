const logger = require('../logger.cjs');
const { logAudit } = require('../auditHelper.cjs');
// POST /api/automation - Cria automação
router.post('/', express.json(), async (req, res) => {
  try {
    const automation = await automationRepo.insert(req.body);
    await logAudit({ req, action: 'create', resourceType: 'automation', resourceId: automation.id, newValues: automation });
    res.json({ success: true, automation });
  } catch (error) {
    logger.error('Erro ao criar automação', { error });
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/automation/:id - Atualiza automação
router.put('/:id', express.json(), async (req, res) => {
  const { id } = req.params;
  try {
    const oldAutomation = await automationRepo.getById(id);
    const updatedAutomation = await automationRepo.update(id, req.body);
    await logAudit({ req, action: 'update', resourceType: 'automation', resourceId: id, oldValues: oldAutomation, newValues: updatedAutomation });
    res.json({ success: true, automation: updatedAutomation });
  } catch (error) {
    logger.error('Erro ao atualizar automação', { error });
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/automation/:id - Remove automação
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const oldAutomation = await automationRepo.getById(id);
    await automationRepo.delete(id);
    await logAudit({ req, action: 'delete', resourceType: 'automation', resourceId: id, oldValues: oldAutomation });
    res.json({ success: true });
  } catch (error) {
    logger.error('Erro ao remover automação', { error });
    res.status(500).json({ error: error.message });
  }
});
const express = require('express');
const router = express.Router();
const automationRepo = require('../repositories/automationRepository.cjs');

// GET /api/automation - Lista automações
router.get('/', async (req, res) => {
  try {
    const data = await automationRepo.listAll();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/automation - Cria automação
router.post('/', express.json(), async (req, res) => {
  try {
    const data = await automationRepo.insert(req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/automation/:id - Atualiza automação
router.put('/:id', express.json(), async (req, res) => {
  const { id } = req.params;
  try {
    const data = await automationRepo.update(id, req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/automation/:id - Remove automação
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await automationRepo.remove(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
