const logger = require('../logger.cjs');
const { logAudit } = require('../auditHelper.cjs');
// POST /api/templates - Cria template
router.post('/', express.json(), async (req, res) => {
  try {
    const template = await templatesRepo.insert(req.body);
    await logAudit({ req, action: 'create', resourceType: 'template', resourceId: template.id, newValues: template });
    res.json({ success: true, template });
  } catch (error) {
    logger.error('Erro ao criar template', { error });
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/templates/:id - Atualiza template
router.put('/:id', express.json(), async (req, res) => {
  const { id } = req.params;
  try {
    const oldTemplate = await templatesRepo.getById(id);
    const updatedTemplate = await templatesRepo.update(id, req.body);
    await logAudit({ req, action: 'update', resourceType: 'template', resourceId: id, oldValues: oldTemplate, newValues: updatedTemplate });
    res.json({ success: true, template: updatedTemplate });
  } catch (error) {
    logger.error('Erro ao atualizar template', { error });
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/templates/:id - Remove template
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const oldTemplate = await templatesRepo.getById(id);
    await templatesRepo.delete(id);
    await logAudit({ req, action: 'delete', resourceType: 'template', resourceId: id, oldValues: oldTemplate });
    res.json({ success: true });
  } catch (error) {
    logger.error('Erro ao remover template', { error });
    res.status(500).json({ error: error.message });
  }
});
const express = require('express');
const router = express.Router();
const templatesRepo = require('../repositories/templatesRepository.cjs');

// GET /api/templates - Lista templates
router.get('/', async (req, res) => {
  try {
    const data = await templatesRepo.listAll();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/templates - Cria template
router.post('/', express.json(), async (req, res) => {
  try {
    const data = await templatesRepo.insert(req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/templates/:id - Atualiza template
router.put('/:id', express.json(), async (req, res) => {
  const { id } = req.params;
  try {
    const data = await templatesRepo.update(id, req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/templates/:id - Remove template
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await templatesRepo.remove(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
