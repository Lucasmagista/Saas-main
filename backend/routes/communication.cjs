const express = require('express');
const router = express.Router();
const communicationRepo = require('../repositories/communicationRepository.cjs');

// GET /api/communication - Lista comunicações
router.get('/', async (req, res) => {
  try {
    const data = await communicationRepo.listAll();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/communication - Cria comunicação
router.post('/', express.json(), async (req, res) => {
  try {
    const data = await communicationRepo.insert(req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/communication/:id - Atualiza comunicação
router.put('/:id', express.json(), async (req, res) => {
  const { id } = req.params;
  try {
    const data = await communicationRepo.update(id, req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/communication/:id - Remove comunicação
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await communicationRepo.remove(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
