

jest.mock('../supabaseClient.js');
jest.mock('@wppconnect-team/wppconnect');
jest.mock('../repositories/botSessionsRepository.cjs', () => ({
  insert: async () => ({}),
  update: async () => ({}),
  getById: async () => ({}),
  getAll: async () => ([]),
  delete: async () => ({ success: true })
}));
jest.mock('../repositories/multisessionLogsRepository.cjs', () => ({
  insert: async () => ({}),
  getAll: async () => ([])
}));
jest.mock('../repositories/botsRepository.cjs', () => ({
  update: async () => ({}),
  getById: async () => ({}),
  getAll: async () => ([])
}));
const botManager = require('../services/botManager.cjs');
const botSessionsRepo = require('../repositories/botSessionsRepository.cjs');

describe('botManager', () => {
  const bot = { id: 'test-bot', session_name: 'test-session' };

  beforeAll(async () => {
    // Limpa sessão persistida antes dos testes
    await botSessionsRepo.delete(bot.id);
  });

  it('deve iniciar uma sessão e retornar QR code', async () => {
    const qr = await botManager.startSession(bot);
    expect(qr === null || typeof qr === 'string').toBe(true);
    expect(botManager.isSessionActive(bot.id)).toBe(true);
  });

  it('deve encerrar uma sessão', async () => {
    await botManager.stopSession(bot.id);
    expect(botManager.isSessionActive(bot.id)).toBe(false);
  });

  it('deve retornar sessão persistida', async () => {
    const session = await botManager.getPersistedSession(bot.id);
    expect(session === null || typeof session === 'object').toBe(true);
  });

  it('deve retornar logs em memória', () => {
    const logs = botManager.getLogs(bot.id);
    expect(Array.isArray(logs)).toBe(true);
  });
});
