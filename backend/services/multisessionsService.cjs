/*
 * Serviço responsável por operações com a tabela de multi‑sessões. Ele delega
 * persistência ao banco local e integra com o botManager para iniciar ou
 * encerrar sessões WPPConnect conforme necessário. A separação em serviço
 * permite que as rotas (controllers) fiquem mais enxutas e facilite testes.
 */
const multisessionsRepo = require('../repositories/multisessionsRepository.cjs');
const { startSession, stopSession, isSessionActive } = require('./botManager.cjs');

async function listSessions() {
  try {
    const data = await multisessionsRepo.listAll();
    // Enriquecemos com a flag de ativo baseada no gerenciador em memória
    return (data || []).map((sess) => ({ ...sess, active: isSessionActive(sess.id) }));
  } catch (err) {
    console.error('[multisessionsService] Erro ao listar sessões:', err);
    throw new Error('Erro ao listar sessões');
  }
}

async function createSession(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Payload inválido para criação de sessão');
  }
  let sessionRecord;
  try {
    sessionRecord = await multisessionsRepo.insert(payload);
    // Se solicitado ativa a sessão
    if (sessionRecord.is_active) {
      try {
        await startSession({ id: sessionRecord.id, session_name: sessionRecord.session_name });
        sessionRecord = await multisessionsRepo.update(sessionRecord.id, { is_active: true });
      } catch (err) {
        console.error(`[multisessionsService] Erro ao iniciar sessão para ${sessionRecord.id}:`, err);
        // Opcional: desfazer ativação no banco se falhar
        await multisessionsRepo.update(sessionRecord.id, { is_active: false });
        throw new Error('Erro ao iniciar sessão WPPConnect');
      }
    }
    return sessionRecord;
  } catch (err) {
    console.error('[multisessionsService] Erro ao criar sessão:', err);
    throw new Error('Erro ao criar sessão');
  }
}

async function updateSession(id, updatedFields) {
  if (!id) throw new Error('ID da sessão é obrigatório');
  // Obtem sessão atual
  let current;
  try {
    current = await multisessionsRepo.findById(id);
  } catch (err) {
    console.error(`[multisessionsService] Erro ao buscar sessão ${id}:`, err);
    throw new Error('Erro ao buscar sessão');
  }
  if (!current) throw new Error('Sessão não encontrada');
  // Atualiza registro no banco
  let sessionRecord;
  try {
    sessionRecord = await multisessionsRepo.update(id, updatedFields);
    // Se mudou de inativo para ativo
    if (!current.is_active && sessionRecord.is_active) {
      try {
        await startSession({ id: sessionRecord.id, session_name: sessionRecord.session_name });
        sessionRecord = { ...sessionRecord, is_active: true };
      } catch (err) {
        console.error(`[multisessionsService] Erro ao ativar sessão ${sessionRecord.id}:`, err);
        sessionRecord = { ...sessionRecord, is_active: false };
        await multisessionsRepo.update(sessionRecord.id, { is_active: false });
        throw new Error('Erro ao ativar sessão WPPConnect');
      }
    } else if (current.is_active && !sessionRecord.is_active) {
      try {
        await stopSession(sessionRecord.id);
        sessionRecord = { ...sessionRecord, is_active: false };
      } catch (err) {
        console.error(`[multisessionsService] Erro ao encerrar sessão ${sessionRecord.id}:`, err);
        throw new Error('Erro ao encerrar sessão WPPConnect');
      }
    }
    return sessionRecord;
  } catch (err) {
    console.error(`[multisessionsService] Erro ao atualizar sessão ${id}:`, err);
    throw new Error('Erro ao atualizar sessão');
  }
}

async function deleteSession(id) {
  if (!id) throw new Error('ID da sessão é obrigatório');
  try {
    // Encerra sessão caso ativa
    await stopSession(id);
  } catch (err) {
    console.error(`[multisessionsService] Erro ao encerrar sessão antes de remover ${id}:`, err);
    // Continua para tentar remover do banco mesmo se falhar
  }
  try {
    return await multisessionsRepo.remove(id);
  } catch (err) {
    console.error(`[multisessionsService] Erro ao remover sessão ${id}:`, err);
    throw new Error('Erro ao remover sessão');
  }
}

module.exports = {
  /**
   * Lista todas as sessões multi-sessão, enriquecendo com status ativo
   */
  listSessions,
  /**
   * Cria uma nova sessão multi-sessão
   */
  createSession,
  /**
   * Atualiza uma sessão multi-sessão existente
   */
  updateSession,
  /**
   * Remove uma sessão multi-sessão
   */
  deleteSession,
};
