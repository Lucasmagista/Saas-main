const express = require('express');
const emailProvidersRepo = require('../repositories/emailProvidersRepository.cjs');
const emailLogsRepo = require('../repositories/emailLogsRepository.cjs');

const router = express.Router();

// GET /api/email/providers
// Retorna a lista de provedores de e-mail configurados. Tenta carregar da
// tabela `email_providers` do Supabase; se não existir ou houver erro,
// retorna uma lista vazia. Em uma implementação completa, este endpoint
// deveria suportar criação, atualização e remoção.
router.get('/providers', async (req, res) => {
  try {
    const data = await emailProvidersRepo.listAll();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/email/logs
// Retorna logs de envios de e-mail. Tenta carregar da tabela `email_logs`;
// se não existir ou houver erro, retorna uma lista vazia.
router.get('/logs', async (req, res) => {
  try {
    const data = await emailLogsRepo.listAll(100);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
