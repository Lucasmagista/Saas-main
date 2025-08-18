const express = require('express');
const { z } = require('zod');
const validate = require('../middleware/validate.cjs');
const authenticateJWT = require('../middleware/authenticateJWT.cjs');
const router = express.Router();
const { sendMessage, getMessages } = require('../services/wppconnect.cjs');

/**
 * API REST para integração com WhatsApp. Estas rotas permitem
 * ao frontend enviar mensagens e obter histórico. O webhook para
 * mensagens recebidas pode ser exposto se o WPPConnect estiver
 * configurado para receber webhooks de eventos.
 */

// Envia uma mensagem para um número especificado. Espera JSON
// com propriedades `number` (destinatário) e `message` (texto).
// Esquema de validação para envio de mensagem
const sendMessageSchema = z.object({
  number: z.string().min(1, 'Número é obrigatório'),
  message: z.string().min(1, 'Mensagem é obrigatória'),
});

router.post('/send', authenticateJWT, express.json(), validate({ body: sendMessageSchema }), async (req, res) => {
  const { number, message } = req.body;
  try {
    const result = await sendMessage(number, message);
    res.json(result);
  } catch (error) {
    console.error('Erro ao enviar mensagem via API:', error);
    res.status(500).json({ error: 'Erro interno ao enviar mensagem.' });
  }
});

// Retorna todas as mensagens armazenadas em memória ou obtidas do
// cliente real. Útil para carregar o histórico de conversas.
router.get('/messages', authenticateJWT, async (req, res) => {
  try {
    let msgs = await getMessages() || [];
    // Aplica filtros opcionais por número e data
    const { number, date } = req.query;
    if (number) {
      msgs = msgs.filter((m) => m.number && m.number.includes(number));
    }
    if (date) {
      // Filtra por data (YYYY-MM-DD). Assume que timestamp é ISO string
      msgs = msgs.filter((m) => {
        if (!m.timestamp) return false;
        const d = new Date(m.timestamp);
        const isoDate = d.toISOString().split('T')[0];
        return isoDate === date;
      });
    }
    // Paginação: page e limit via query string
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginated = msgs.slice(start, end);
    res.json({
      data: paginated,
      pagination: {
        page,
        limit,
        total: msgs.length,
        totalPages: Math.ceil(msgs.length / limit) || 1,
      },
    });
  } catch (error) {
    console.error('Erro ao obter mensagens:', error);
    res.status(500).json({ error: 'Erro interno ao obter mensagens.' });
  }
});

// Endpoint webhook (opcional). Permite receber mensagens em tempo
// real de fontes externas caso o serviço WPPConnect seja utilizado.
// Recebe eventos POST de mensagens recebidas do WhatsApp.
// Exemplo de payload esperado: { "number": "5511999999999", "message": "Olá!", ... }
// Agora com validação de payload e resposta detalhada.
const botLogsRepo = require('../repositories/botLogsRepository.cjs');

const webhookSchema = z.object({
  number: z.string().min(8, 'Número inválido'),
  message: z.string().min(1, 'Mensagem obrigatória'),
  id: z.string().optional(),
  timestamp: z.string().optional(),
});

router.post('/webhook', express.json(), async (req, res) => {
  try {
    const parse = webhookSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Payload inválido', details: parse.error.errors });
    }
    const event = parse.data;
    // Loga o evento recebido
    console.log('Webhook recebido do WhatsApp:', event);

    // Adiciona ao array mockMessages, se existir (modo simulado)
    const msgs = await getMessages();
    if (Array.isArray(msgs)) {
      const msg = {
        id: event.id || Date.now().toString(),
        number: event.number,
        message: event.message,
        fromMe: false,
        timestamp: event.timestamp || new Date().toISOString(),
      };
      msgs.push(msg);
    }

    // Persiste log no Supabase
    await botLogsRepo.insert({
      bot_id: null,
      direction: 'received',
      message: event.message,
      type: null,
    });

    res.status(200).json({ status: 'ok', received: true, data: event });
  } catch (error) {
    console.error('Erro no webhook do WhatsApp:', {
      error: error.message,
      stack: error.stack,
      body: req.body,
    });
    res.status(500).json({ error: 'Erro interno no webhook.' });
  }
});

module.exports = router;
