const express = require('express');
const router = express.Router();
const billingRepo = require('../repositories/billingRepository.cjs');

// GET /api/billing - Lista cobranças
router.get('/', async (req, res) => {
  try {
    const data = await billingRepo.listAll();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/billing - Cria cobrança
router.post('/', express.json(), async (req, res) => {
  try {
    const data = await billingRepo.insert(req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/billing/:id - Atualiza cobrança
router.put('/:id', express.json(), async (req, res) => {
  const { id } = req.params;
  try {
    const data = await billingRepo.update(id, req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/billing/:id - Remove cobrança
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await billingRepo.remove(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
