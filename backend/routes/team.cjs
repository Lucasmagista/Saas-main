const logger = require('../logger.cjs');
const { logAudit } = require('../auditHelper.cjs');
const express = require('express');
const router = express.Router();
const teamRepo = require('../repositories/teamRepository.cjs');

// POST /api/team - Cria equipe
router.post('/', express.json(), async (req, res) => {
  try {
    const team = await teamRepo.insert(req.body);
    await logAudit({ req, action: 'create', resourceType: 'team', resourceId: team.id, newValues: team });
    res.json({ success: true, team });
  } catch (error) {
    logger.error('Erro ao criar equipe', { error });
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/team/:id - Atualiza equipe
router.put('/:id', express.json(), async (req, res) => {
  const { id } = req.params;
  try {
    const oldTeam = await teamRepo.getById(id);
    const updatedTeam = await teamRepo.update(id, req.body);
    await logAudit({ req, action: 'update', resourceType: 'team', resourceId: id, oldValues: oldTeam, newValues: updatedTeam });
    res.json({ success: true, team: updatedTeam });
  } catch (error) {
    logger.error('Erro ao atualizar equipe', { error });
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/team/:id - Remove equipe
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const oldTeam = await teamRepo.getById(id);
    await teamRepo.delete(id);
    await logAudit({ req, action: 'delete', resourceType: 'team', resourceId: id, oldValues: oldTeam });
    res.json({ success: true });
  } catch (error) {
    logger.error('Erro ao remover equipe', { error });
    res.status(500).json({ error: error.message });
  }
});

// GET /api/team - Lista membros
router.get('/', async (req, res) => {
  try {
    const data = await teamRepo.listAll();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/team - Cria membro
router.post('/', express.json(), async (req, res) => {
  try {
    const data = await teamRepo.insert(req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/team/:id - Atualiza membro
router.put('/:id', express.json(), async (req, res) => {
  const { id } = req.params;
  try {
    const data = await teamRepo.update(id, req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/team/:id - Remove membro
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await teamRepo.remove(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
