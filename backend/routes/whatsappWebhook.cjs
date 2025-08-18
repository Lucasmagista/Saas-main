const express = require('express');
const supabase = require('../supabaseClient.cjs');
const router = express.Router();

// Webhook para receber mensagens inbound do WPPConnect. Este endpoint
// pode ser chamado pelo serviço wppconnect para processar mensagens
// recebidas de forma assíncrona. Ele persiste a mensagem no banco e
// poderia encaminhar para filas ou outros sistemas.
router.post('/', async (req, res) => {
  try {
    // Validação básica do corpo da requisição
    if (!req.is('application/json')) {
      return res.status(415).json({ error: 'Content-Type deve ser application/json' });
    }
    const { id, number, message, fromMe, timestamp } = req.body || {};

    // Log detalhado da requisição recebida
    console.info('[Webhook WhatsApp] Payload recebido:', JSON.stringify(req.body));

    // Validação dos campos obrigatórios
    if (!number || typeof number !== 'string' || !message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes ou inválidos: number, message' });
    }

    // Validação opcional dos demais campos
    if (fromMe !== undefined && typeof fromMe !== 'boolean') {
      return res.status(400).json({ error: 'Campo fromMe deve ser booleano' });
    }
    if (timestamp !== undefined && isNaN(Number(timestamp))) {
      return res.status(400).json({ error: 'Campo timestamp deve ser numérico' });
    }

    // Persistência da mensagem
    const insertData = {
      bot_id: null, // Ajuste se necessário para identificar o bot
      direction: fromMe ? 'sent' : 'received',
      message,
      type: null,
      number,
      timestamp: timestamp ? Number(timestamp) : null,
      created_at: new Date().toISOString(),
      raw_id: id || null,
    };

    const { error: dbError } = await supabase.from('bot_logs').insert(insertData);
    if (dbError) {
      console.error('[Webhook WhatsApp] Erro ao inserir no banco:', dbError);
      return res.status(500).json({ error: 'Erro ao persistir mensagem no banco' });
    }

    // Sucesso
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[Webhook WhatsApp] Erro inesperado:', err);
    return res.status(500).json({ error: 'Erro ao processar webhook' });
  }
});

module.exports = router;
