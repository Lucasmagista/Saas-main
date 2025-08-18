const express = require('express');
const router = express.Router();
const supportRepo = require('../repositories/supportRepository.cjs');

// GET /api/support - Lista tickets de suporte
router.get('/', async (req, res) => {
  try {
    const data = await supportRepo.listAll();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/support - Cria ticket de suporte
router.post('/', express.json(), async (req, res) => {
  try {
    const data = await supportRepo.insert(req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/support/:id - Atualiza ticket
router.put('/:id', express.json(), async (req, res) => {
  const { id } = req.params;
  try {
    const data = await supportRepo.update(id, req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/support/:id - Remove ticket
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await supportRepo.remove(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
