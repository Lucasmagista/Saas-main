const express = require('express');
const { z } = require('zod');
const validate = require('../middleware/validate.cjs');
const authenticateJWT = require('../middleware/authenticateJWT.cjs');
const multisessionsService = require('../services/multisessionsService.cjs');
// A lógica de iniciar/parar sessões está encapsulada no multisessionsService

const router = express.Router();

// GET /api/multisessions - Lista sessões (removendo autenticação temporariamente)
router.get('/', async (req, res) => {
  try {
    const sessions = await multisessionsService.listSessions();
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/multisessions - Cria sessão
// Define o esquema de validação para criação de sessão
const createSessionSchema = z.object({
  name: z.string({ required_error: 'name é obrigatório' }).min(1),
  platform: z.string({ required_error: 'platform é obrigatório' }).min(1),
  session_name: z.string().optional(),
  phone_number: z.string().optional(),
  is_active: z.boolean().optional().default(false),
  organization_id: z.string().optional(),
  config: z.any().optional(),
});

router.post('/', express.json(), validate({ body: createSessionSchema }), async (req, res) => {
  try {
    const sessionRecord = await multisessionsService.createSession(req.body);
    res.json(sessionRecord);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/multisessions/:id - Atualiza sessão
// Esquema para atualizar sessão (todos os campos opcionais). id será validado via params
const updateSessionSchema = z.object({
  name: z.string().optional(),
  platform: z.string().optional(),
  session_name: z.string().optional(),
  phone_number: z.string().optional(),
  is_active: z.boolean().optional(),
  organization_id: z.string().optional(),
  config: z.any().optional(),
  bot_id: z.string().optional().nullable(),
});

const paramsSchema = z.object({ id: z.string() });
// POST /api/multisessions/:id/assign-bot - Atribui/desatribui bot à sessão
router.post('/:id/assign-bot', express.json(), validate({ params: paramsSchema, body: z.object({ bot_id: z.string().nullable() }) }), async (req, res) => {
  const { id } = req.params;
  const { bot_id } = req.body;
  try {
    const sessionRecord = await multisessionsService.updateSession(id, { bot_id });
    res.json(sessionRecord);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', express.json(), validate({ body: updateSessionSchema, params: paramsSchema }), async (req, res) => {
  const { id } = req.params;
  try {
    const sessionRecord = await multisessionsService.updateSession(id, req.body);
    res.json(sessionRecord);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/multisessions/:id - Remove sessão
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await multisessionsService.deleteSession(id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
