const logger = require('../logger.cjs');
const { logAudit } = require('../auditHelper.cjs');
// POST /api/marketplace - Cria item
router.post('/', express.json(), async (req, res) => {
  try {
    const item = await marketplaceRepo.insert(req.body);
    await logAudit({ req, action: 'create', resourceType: 'marketplace', resourceId: item.id, newValues: item });
    res.json({ success: true, item });
  } catch (error) {
    logger.error('Erro ao criar item marketplace', { error });
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/marketplace/:id - Atualiza item
router.put('/:id', express.json(), async (req, res) => {
  const { id } = req.params;
  try {
    const oldItem = await marketplaceRepo.getById(id);
    const updatedItem = await marketplaceRepo.update(id, req.body);
    await logAudit({ req, action: 'update', resourceType: 'marketplace', resourceId: id, oldValues: oldItem, newValues: updatedItem });
    res.json({ success: true, item: updatedItem });
  } catch (error) {
    logger.error('Erro ao atualizar item marketplace', { error });
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/marketplace/:id - Remove item
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const oldItem = await marketplaceRepo.getById(id);
    await marketplaceRepo.delete(id);
    await logAudit({ req, action: 'delete', resourceType: 'marketplace', resourceId: id, oldValues: oldItem });
    res.json({ success: true });
  } catch (error) {
    logger.error('Erro ao remover item marketplace', { error });
    res.status(500).json({ error: error.message });
  }
});
const express = require('express');
const router = express.Router();
const marketplaceRepo = require('../repositories/marketplaceRepository.cjs');

// GET /api/marketplace - Lista itens do marketplace
router.get('/', async (req, res) => {
  try {
    const data = await marketplaceRepo.listAll();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/marketplace - Cria item no marketplace
router.post('/', express.json(), async (req, res) => {
  try {
    const data = await marketplaceRepo.insert(req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/marketplace/:id - Atualiza item
router.put('/:id', express.json(), async (req, res) => {
  const { id } = req.params;
  try {
    const data = await marketplaceRepo.update(id, req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/marketplace/:id - Remove item
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await marketplaceRepo.remove(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
