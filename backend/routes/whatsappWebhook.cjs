const express = require('express');
const supabase = require('../supabaseClient.cjs');
const config = require('../config.cjs');
const logger = require('../logger.cjs');
const router = express.Router();

// Função para validar assinatura do webhook (se configurada)
function validateWebhookSignature(req, secret) {
  if (!secret) return true; // Se não há secret, não valida
  
  const signature = req.headers['x-hub-signature-256'] || req.headers['x-hub-signature'];
  if (!signature) {
    logger.warn('Webhook sem assinatura recebido');
    return false;
  }
  
  // Implementar validação de assinatura conforme necessário
  // Por enquanto, apenas verifica se existe
  return true;
}

// Função para enviar webhook com retry
async function sendWebhookWithRetry(webhookUrl, payload, maxRetries = config.webhookRetries) {
  const fetch = (await import('node-fetch')).default;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'saas-platform-webhook/1.0',
          'X-Webhook-Source': 'whatsapp-integration'
        },
        body: JSON.stringify(payload),
        timeout: config.webhookTimeout
      });
      
      if (response.ok) {
        logger.info('Webhook enviado com sucesso', { 
          url: webhookUrl, 
          status: response.status,
          attempt 
        });
        return { success: true, status: response.status };
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      logger.warn(`Tentativa ${attempt} falhou para webhook`, { 
        url: webhookUrl, 
        error: error.message 
      });
      
      if (attempt === maxRetries) {
        logger.error('Todas as tentativas de webhook falharam', { 
          url: webhookUrl, 
          error: error.message 
        });
        return { success: false, error: error.message };
      }
      
      // Aguarda antes da próxima tentativa (backoff exponencial)
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
    }
  }
}

// Função para processar webhooks configurados
async function processConfiguredWebhooks(eventData) {
  try {
    // Buscar webhooks ativos no banco
    const { data: webhooks, error } = await supabase
      .from('webhooks')
      .select('*')
      .eq('is_active', true);
    
    if (error) {
      logger.error('Erro ao buscar webhooks configurados:', error);
      return;
    }
    
    if (!webhooks || webhooks.length === 0) {
      logger.debug('Nenhum webhook configurado encontrado');
      return;
    }
    
    // Filtrar webhooks que devem receber este evento
    const relevantWebhooks = webhooks.filter(webhook => {
      return webhook.events && webhook.events.includes('whatsapp.message');
    });
    
    // Enviar para cada webhook relevante
    const promises = relevantWebhooks.map(webhook => 
      sendWebhookWithRetry(webhook.url, {
        event: 'whatsapp.message',
        timestamp: new Date().toISOString(),
        data: eventData,
        webhook_id: webhook.id
      })
    );
    
    const results = await Promise.allSettled(promises);
    
    // Log dos resultados
    results.forEach((result, index) => {
      const webhook = relevantWebhooks[index];
      if (result.status === 'fulfilled') {
        logger.info('Webhook processado', { 
          webhook_id: webhook.id, 
          url: webhook.url,
          result: result.value 
        });
      } else {
        logger.error('Erro ao processar webhook', { 
          webhook_id: webhook.id, 
          url: webhook.url,
          error: result.reason 
        });
      }
    });
    
  } catch (error) {
    logger.error('Erro ao processar webhooks configurados:', error);
  }
}

// Webhook para receber mensagens inbound do WPPConnect
router.post('/', async (req, res) => {
  try {
    // Validação básica do corpo da requisição
    if (!req.is('application/json')) {
      logger.warn('Webhook recebido com Content-Type inválido', { 
        contentType: req.get('Content-Type') 
      });
      return res.status(415).json({ 
        error: 'Content-Type deve ser application/json' 
      });
    }
    
    const { id, number, message, fromMe, timestamp, type, mediaUrl } = req.body || {};

    // Log detalhado da requisição recebida
    logger.info('Webhook WhatsApp recebido', {
      id,
      number,
      messageLength: message?.length,
      fromMe,
      timestamp,
      type,
      hasMedia: !!mediaUrl,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

    // Validação dos campos obrigatórios
    if (!number || typeof number !== 'string') {
      logger.warn('Webhook com número inválido', { number });
      return res.status(400).json({ 
        error: 'Campo number é obrigatório e deve ser string' 
      });
    }
    
    if (!message || typeof message !== 'string') {
      logger.warn('Webhook com mensagem inválida', { message });
      return res.status(400).json({ 
        error: 'Campo message é obrigatório e deve ser string' 
      });
    }

    // Validação opcional dos demais campos
    if (fromMe !== undefined && typeof fromMe !== 'boolean') {
      logger.warn('Webhook com fromMe inválido', { fromMe });
      return res.status(400).json({ 
        error: 'Campo fromMe deve ser booleano' 
      });
    }
    
    if (timestamp !== undefined && isNaN(Number(timestamp))) {
      logger.warn('Webhook com timestamp inválido', { timestamp });
      return res.status(400).json({ 
        error: 'Campo timestamp deve ser numérico' 
      });
    }

    // Validar assinatura do webhook se configurada
    const webhookSecret = process.env.WEBHOOK_SECRET;
    if (!validateWebhookSignature(req, webhookSecret)) {
      logger.warn('Webhook com assinatura inválida', { 
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      return res.status(401).json({ 
        error: 'Assinatura do webhook inválida' 
      });
    }

    // Persistência da mensagem
    const insertData = {
      bot_id: null, // Ajuste se necessário para identificar o bot
      direction: fromMe ? 'sent' : 'received',
      message,
      type: type || 'text',
      number,
      timestamp: timestamp ? Number(timestamp) : null,
      created_at: new Date().toISOString(),
      raw_id: id || null,
      media_url: mediaUrl || null,
      metadata: {
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        headers: req.headers
      }
    };

    const { error: dbError } = await supabase.from('bot_logs').insert(insertData);
    if (dbError) {
      logger.error('Erro ao inserir mensagem no banco:', dbError);
      return res.status(500).json({ 
        error: 'Erro ao persistir mensagem no banco' 
      });
    }

    // Processar webhooks configurados (assíncrono)
    processConfiguredWebhooks({
      id,
      number,
      message,
      fromMe,
      timestamp,
      type,
      mediaUrl
    }).catch(error => {
      logger.error('Erro ao processar webhooks configurados:', error);
    });

    // Log de sucesso
    logger.info('Webhook processado com sucesso', {
      messageId: id,
      number,
      direction: fromMe ? 'sent' : 'received'
    });

    // Sucesso
    return res.status(200).json({ 
      success: true,
      message: 'Webhook processado com sucesso',
      timestamp: new Date().toISOString()
    });
    
  } catch (err) {
    logger.error('Erro inesperado no webhook:', err);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint para testar webhook
router.get('/test', async (req, res) => {
  try {
    // Verificar se o banco está acessível
    const { error: dbTest } = await supabase
      .from('bot_logs')
      .select('count')
      .limit(1);
    
    if (dbTest) {
      return res.status(500).json({
        status: 'error',
        message: 'Banco de dados não acessível',
        error: dbTest.message
      });
    }
    
    // Verificar webhooks configurados
    const { data: webhooks, error: webhookError } = await supabase
      .from('webhooks')
      .select('count')
      .eq('is_active', true);
    
    return res.status(200).json({
      status: 'ok',
      message: 'Webhook endpoint funcionando',
      database: 'connected',
      activeWebhooks: webhooks?.length || 0,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Erro no teste do webhook:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Erro interno',
      error: error.message
    });
  }
});

module.exports = router;
