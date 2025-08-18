const express = require('express');
const router = express.Router();
const settingsRepo = require('../repositories/settingsRepository.cjs');

// GET /api/settings - Busca configurações
router.get('/', async (req, res) => {
  try {
    const data = await settingsRepo.getSettings();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/settings - Atualiza configurações
router.put('/', express.json(), async (req, res) => {
  try {
    const data = await settingsRepo.updateSettings(req.body.id, req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
