const logger = require('../logger.cjs');
const { logAudit } = require('../auditHelper.cjs');
// POST /api/security - Cria registro de segurança
router.post('/', express.json(), async (req, res) => {
  try {
    const security = await securityRepo.insert(req.body);
    await logAudit({ req, action: 'create', resourceType: 'security', resourceId: security.id, newValues: security });
    res.json({ success: true, security });
  } catch (error) {
    logger.error('Erro ao criar registro de segurança', { error });
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/security/:id - Atualiza registro de segurança
router.put('/:id', express.json(), async (req, res) => {
  const { id } = req.params;
  try {
    const oldSecurity = await securityRepo.getById(id);
    const updatedSecurity = await securityRepo.update(id, req.body);
    await logAudit({ req, action: 'update', resourceType: 'security', resourceId: id, oldValues: oldSecurity, newValues: updatedSecurity });
    res.json({ success: true, security: updatedSecurity });
  } catch (error) {
    logger.error('Erro ao atualizar registro de segurança', { error });
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/security/:id - Remove registro de segurança
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const oldSecurity = await securityRepo.getById(id);
    await securityRepo.delete(id);
    await logAudit({ req, action: 'delete', resourceType: 'security', resourceId: id, oldValues: oldSecurity });
    res.json({ success: true });
  } catch (error) {
    logger.error('Erro ao remover registro de segurança', { error });
    res.status(500).json({ error: error.message });
  }
});
const express = require('express');
const router = express.Router();
const securityRepo = require('../repositories/securityRepository.cjs');

// GET /api/security - Lista configurações de segurança
router.get('/', async (req, res) => {
  try {
    const data = await securityRepo.listAll();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/security - Cria configuração de segurança
router.post('/', express.json(), async (req, res) => {
  try {
    const data = await securityRepo.insert(req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/security/:id - Atualiza configuração
router.put('/:id', express.json(), async (req, res) => {
  const { id } = req.params;
  try {
    const data = await securityRepo.update(id, req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/security/:id - Remove configuração
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await securityRepo.remove(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
