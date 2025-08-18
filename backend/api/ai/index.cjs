// backend/api/ai/index.cjs
// Faz o roteamento dos endpoints de IA para o padrão Express (CommonJS)

const express = require('express');
const router = express.Router();

// Importa os handlers
const providers = require('./providers.cjs');
const chat = require('./chat.cjs');

// GET /api/ai/providers
router.get('/providers', providers);
// POST /api/ai/chat
router.post('/chat', chat);

module.exports = router;
