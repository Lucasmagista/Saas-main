/*
 * Serviço de integração com o WPPConnect. Para ambientes em que a
 * biblioteca real não está disponível, é fornecida uma implementação
 * simplificada que apenas mantém um array de mensagens em memória.
 * Caso deseje utilizar a biblioteca oficial, substitua as funções
 * correspondentes por chamadas reais do WPPConnect.
 */

const wppconnect = require('@wppconnect-team/wppconnect');
const fetch = require('node-fetch');
const botLogsRepo = require('../repositories/botLogsRepository.cjs');
const whatsappLogsRepo = require('../repositories/whatsappLogsRepository.cjs');
const qrCodesRepo = require('../repositories/qrCodesRepository.cjs');
let realClient = null;

// Função auxiliar para inicializar o cliente WPPConnect com retries. Se
// houver falha ao iniciar, agenda uma nova tentativa após 30 segundos.
async function initClient(retryCount = 0) {
  try {
    const client = await wppconnect.create();
    realClient = client;
    console.log('Cliente WPPConnect iniciado com sucesso.');

    // Persiste QR codes gerados. Quando o cliente emite o evento `qr`,
    // salva na tabela qr_codes e também loga em bot_logs para retrocompatibilidade.
    client.on('qr', async (qrCode) => {
      try {
        await qrCodesRepo.insert({
          bot_id: null,
          qr_code: qrCode,
          status: 'pending',
        });
        await botLogsRepo.insert({
          bot_id: null,
          direction: 'system',
          message: `QR code gerado: ${qrCode}`,
          type: 'qr',
        });
      } catch (err) {
        console.error('Erro ao persistir QR code:', err);
      }
    });
  } catch (err) {
    console.error('Erro ao iniciar WPPConnect:', err);
    realClient = null;
    if (retryCount < 5) {
      // Agenda nova tentativa após 30 segundos
      setTimeout(() => initClient(retryCount + 1), 30000);
    }
  }
}

initClient();

// Armazena mensagens do banco de dados ou APIs reais
let messageCache = [];
let lastCacheUpdate = 0;
const CACHE_TTL = 30000; // 30 segundos

/**
 * Envia uma mensagem via WhatsApp. Se o cliente real estiver
 * disponível, delega a chamada. Caso contrário, retorna erro.
 *
 * @param {string} number Número do destinatário no formato internacional.
 * @param {string} message Texto da mensagem a ser enviada.
 * @returns {Promise<object>} Mensagem enviada com metadados.
 */
async function sendMessage(number, message) {
  if (!number || typeof number !== 'string' || !message || typeof message !== 'string') {
    throw new Error('Parâmetros inválidos para envio de mensagem');
  }
  
  if (realClient) {
    try {
      const response = await realClient.sendText(number, message);
      
      // Persiste no banco de dados (PostgreSQL local)
      try {
        const db = require('../postgresClient.cjs');
        await db.query(
          `INSERT INTO messages (external_id, phone_number, message_body, direction, platform, status, created_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [
            response.id || Date.now().toString(),
            number,
            message,
            'sent',
            'whatsapp',
            'sent',
            new Date().toISOString(),
          ]
        );
      } catch (dbError) {
        console.error('[wppconnect] Erro ao salvar mensagem no banco:', dbError);
      }
      
      return {
        id: response.id || Date.now().toString(),
        number,
        message,
        fromMe: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[wppconnect] Erro ao enviar mensagem:', error);
      throw new Error('Erro ao enviar mensagem via WPPConnect');
    }
  }
  
  // Se não há cliente real conectado, retorna erro
  throw new Error('Cliente WhatsApp não está conectado. Verifique a sessão.');
}

/**
 * Obtém o histórico de mensagens do banco de dados real.
 * Implementa cache para melhorar performance.
 */
async function getMessages() {
  const now = Date.now();
  
  // Verifica se o cache ainda é válido
  if (messageCache.length > 0 && (now - lastCacheUpdate) < CACHE_TTL) {
    return messageCache;
  }
  
  try {
    const db = require('../postgresClient.cjs');
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const result = await db.query(
      'SELECT * FROM messages WHERE created_at >= $1 ORDER BY created_at DESC LIMIT 100',
      [since]
    );

    messageCache = result.rows.map((msg) => ({
      id: msg.external_id || msg.id,
      number: msg.phone_number,
      message: msg.message_body,
      fromMe: msg.direction === 'sent',
      timestamp: msg.created_at,
    }));
    
    lastCacheUpdate = now;
    return messageCache;
    
  } catch (error) {
    console.error('[wppconnect] Erro ao acessar banco de dados:', error);
    return messageCache; // Retorna cache existente
  }
}

/**
 * Registra um callback para tratar mensagens recebidas em tempo
 * real. Quando a biblioteca real está disponível, conecta-se ao
 * evento `onMessage` do WPPConnect. Na simulação, dispara uma
 * mensagem a cada 60 segundos para ilustrar a funcionalidade.
 *
 * @param {(msg: object) => void} cb Callback invocado para cada nova mensagem.
 */
// A definição de onMessageReceived foi movida abaixo para incluir o envio ao webhook.

// Sempre que uma mensagem é recebida via onMessageReceived e o cliente é
// real, encaminhamos a mensagem para o webhook interno. O callback cb
// continua sendo invocado para que outras partes do sistema possam
// processar a mensagem também.
function onMessageReceived(cb) {
  if (typeof cb !== 'function') {
    throw new Error('Callback inválido para onMessageReceived');
  }
  if (realClient) {
    realClient.onMessage(async (message) => {
      const data = {
        id: message.id,
        number: message.from,
        message: message.body,
        fromMe: false,
        timestamp: new Date().toISOString(),
      };
      // Envia a mensagem para o webhook interno (caso exista).
      try {
        await fetch('http://localhost:3002/api/whatsapp/webhook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } catch (err) {
        console.error('[wppconnect] Falha ao encaminhar mensagem ao webhook:', err);
      }

      // Persiste log em whatsapp_logs
      try {
        await whatsappLogsRepo.insert({
          bot_id: null,
          direction: data.fromMe ? 'sent' : 'received',
          number: data.number,
          message: data.message,
          event_type: 'message',
        });
      } catch (err) {
        console.error('[wppconnect] Erro ao persistir mensagem em whatsapp_logs:', err);
      }
      // Persiste também em bot_logs para retrocompatibilidade
      try {
        await botLogsRepo.insert({
          bot_id: null,
          direction: data.fromMe ? 'sent' : 'received',
          message: data.message,
          type: null,
        });
      } catch (err) {
        console.error('[wppconnect] Erro ao persistir mensagem em bot_logs:', err);
      }
      try {
        cb(data);
      } catch (err) {
        console.error('[wppconnect] Erro no callback de mensagem recebida:', err);
      }
    });
  } else {
    // Modo stub: apenas invocamos cb quando mensagens são adicionadas ao array mock
    // (não há geração automática de mensagens simuladas).
  }
}

module.exports = { sendMessage, getMessages, onMessageReceived };
