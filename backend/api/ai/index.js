// backend/api/ai/index.js
// Faz o roteamento dos endpoints de IA para o padrão Next.js/Express

const express = require('express');
const router = express.Router();

// Importa os handlers
const providers = require('./providers');
const chat = require('./chat');

// GET /api/ai/providers
router.get('/providers', providers);
// POST /api/ai/chat
router.post('/chat', chat);

module.exports = router;
