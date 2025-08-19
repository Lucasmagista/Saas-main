/*
 * Serviço de gerenciamento de bots com suporte a múltiplas sessões WPPConnect.
 * Cada bot possui um identificador e pode ter uma sessão ativa ou inativa.
 * Este módulo mantém um registro em memória das sessões, QR codes e logs
 * para cada bot. Para persistência, os logs devem ser enviados à base de dados
 * em outra camada. Os QR codes podem ser armazenados no campo `qrcode` da tabela `bots`.
 */

const wppconnect = require('@wppconnect-team/wppconnect');
const botsRepo = require('../repositories/botsRepository.cjs');
const botLogsRepo = require('../repositories/botLogsRepository.cjs');
const multisessionLogsRepo = require('../repositories/multisessionLogsRepository.cjs');
const botSessionsRepo = require('../repositories/botSessionsRepository.cjs');

// Estrutura em memória para armazenar sessões, QR codes e logs por bot
const sessions = {};

/**
 * Inicia uma sessão WPPConnect para um bot específico. Se uma sessão já estiver
 * ativa para este bot, ela é retornada. Caso contrário, cria uma nova sessão
 * com o nome fornecido (sessionName) ou utiliza o id do bot.
 * @param {Object} bot - Objeto do bot contendo id e session_name
 * @returns {Promise<string|null>} - QR code gerado para autenticação ou null se já conectado
 */
async function startSession(bot) {
  const botId = bot.id;
  const sessionName = bot.session_name || bot.id;
  // Se já existe uma sessão ativa, apenas retornamos o QR armazenado
  if (sessions[botId] && sessions[botId].client) {
    return sessions[botId].qrcode || null;
  }
  try {
    // Recupera sessão persistida, se existir
    let persistedSession = null;
    try {
      persistedSession = await botSessionsRepo.getById(botId);
    } catch (e) {
      // Não existe sessão persistida ainda
      console.warn('Aviso: erro ao recuperar sessão persistida para o bot', botId, e);
    }
    const client = await wppconnect.create({ session: sessionName });
    sessions[botId] = { client, qrcode: persistedSession ? persistedSession.qr_data : null, logs: [] };
    // Captura evento de QR code
    client.on('qr', async (qrCode) => {
      sessions[botId].qrcode = qrCode;
      // Persistir o QR code e status da sessão no Supabase
      const sessionData = {
        session_id: botId,
        created_at: persistedSession ? persistedSession.created_at : new Date().toISOString(),
        last_message: persistedSession ? persistedSession.last_message : null,
        status: 'active',
        qr_data: qrCode,
      };
      if (persistedSession) {
        await botSessionsRepo.update(botId, { qr_data: qrCode, status: 'active' });
      } else {
        await botSessionsRepo.insert(sessionData);
      }
      botsRepo.update(botId, { qrcode: qrCode, is_active: true, session_name: sessionName, updated_at: new Date().toISOString() })
        .catch((error) => {
          console.error('Erro ao atualizar QR code no banco:', error);
        });
    });
    // Captura mensagens para armazenar logs em memória
    client.onMessage(async (message) => {
      sessions[botId].logs.push({
        timestamp: new Date().toISOString(),
        direction: message.fromMe ? 'sent' : 'received',
        message: message.body || '',
        type: message.type || null,
      });

      // Persiste log no banco local. Caso ocorra erro, apenas registra no console.
      botLogsRepo.insert({
        bot_id: botId,
        direction: message.fromMe ? 'sent' : 'received',
        message: message.body || '',
        type: message.type || null,
      }).catch((error) => {
        console.error('Erro ao inserir log de bot no banco:', error);
      });

      // Persiste também log de multi-sessão, caso exista uma sessão correspondente.
      multisessionLogsRepo.insert({
        session_id: botId,
        direction: message.fromMe ? 'sent' : 'received',
        message: message.body || '',
        type: message.type || null,
      }).catch((error) => {
        console.error('Erro ao inserir log de multi-sessão no banco:', error);
      });

      // Atualiza last_message e status na sessão persistida
      try {
        await botSessionsRepo.update(botId, {
          last_message: message.body || '',
          status: 'active',
        });
      } catch (e) {
        // Se não existir, cria
        try {
          await botSessionsRepo.insert({
            session_id: botId,
            created_at: new Date().toISOString(),
            last_message: message.body || '',
            status: 'active',
            qr_data: sessions[botId].qrcode || null,
          });
        } catch (insertError) {
          console.error('Erro ao inserir nova sessão persistida:', insertError);
        }
        // Loga o erro original da atualização
        console.error('Erro ao atualizar sessão persistida:', e);
      }
    });

    // Registra evento de inicialização da sessão no log de multi-sessões para auditoria
    multisessionLogsRepo.insert({
      session_id: botId,
      direction: 'system',
      message: 'Sessão iniciada',
      type: 'system',
    }).catch((error) => {
      console.error('Erro ao registrar início de sessão em multi-sessões:', error);
    });
    // Retornamos o QR code inicial se existir
    return sessions[botId].qrcode || null;
  } catch (err) {
    console.error('Erro ao iniciar sessão para bot', botId, err);
    throw err;
  }
}

/**
 * Para a sessão associada a um bot e remove-a da memória.
 * @param {string} botId - Identificador do bot
 */
async function stopSession(botId) {
  const session = sessions[botId];
  if (!session) return;
  try {
    await session.client.logout();
  } catch (err) {
    console.error('Erro ao encerrar sessão para bot', botId, err);
  }
  delete sessions[botId];

  // Atualiza status e remove QR code no banco local
  botsRepo.update(botId, { is_active: false, qrcode: null, updated_at: new Date().toISOString() })
    .catch((error) => {
      console.error('Erro ao atualizar status do bot no banco ao encerrar sessão:', error);
    });
  // Atualiza status da sessão persistida
  botSessionsRepo.update(botId, { status: 'inactive', qr_data: null })
    .catch((error) => {
      console.error('Erro ao atualizar status da sessão persistida:', error);
    });

  // Registra evento de encerramento de sessão no log de multi-sessões para auditoria
  multisessionLogsRepo.insert({
    session_id: botId,
    direction: 'system',
    message: 'Sessão encerrada',
    type: 'system',
  }).catch((error) => {
    console.error('Erro ao registrar encerramento de sessão em multi-sessões:', error);
  });
}

/**
 * Obtém o QR code atual de um bot. Retorna null se não houver QR disponível.
 * @param {string} botId
 */
function getQrcode(botId) {
  return sessions[botId] ? sessions[botId].qrcode : null;
}

/**
 * Obtém a sessão persistida do bot no banco de dados.
 * @param {string} botId
 */
async function getPersistedSession(botId) {
  try {
    return await botSessionsRepo.getById(botId);
  } catch (e) {
    console.error('[botManager] Erro ao obter sessão persistida para botId:', botId, e);
    return null;
  }
}

/**
 * Obtém os logs acumulados em memória para um bot. Para produção, recomenda-se
 * persistir estes logs em banco de dados (tabela bot_logs) periodicamente.
 * @param {string} botId
 */
function getLogs(botId) {
  if (!botId || typeof botId !== 'string') {
    console.warn('[botManager] getLogs chamado com botId inválido:', botId);
    return [];
  }
  if (!sessions[botId]) {
    console.info(`[botManager] Nenhuma sessão encontrada para botId: ${botId}`);
    return [];
  }
  return Array.isArray(sessions[botId].logs) ? sessions[botId].logs : [];
}

/**
 * Verifica se uma sessão está ativa para determinado bot.
 * @param {string} botId
 */
function isSessionActive(botId) {
  if (!botId || typeof botId !== 'string') {
    console.warn('[botManager] isSessionActive chamado com botId inválido:', botId);
    return false;
  }
  return !!(sessions[botId] && sessions[botId].client);
}

module.exports = {
  /**
   * Estrutura em memória das sessões ativas
   */
  sessions,
  /**
   * Inicia uma sessão para um bot
   */
  startSession,
  /**
   * Para uma sessão de bot
   */
  stopSession,
  /**
   * Obtém o QR code atual de um bot
   */
  getQrcode,
  /**
   * Obtém os logs em memória de um bot
   */
  getLogs,
  /**
   * Verifica se a sessão está ativa
   */
  isSessionActive,
  /**
   * Obtém a sessão persistida do bot
   */
  getPersistedSession,
};
