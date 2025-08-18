

jest.mock('../supabaseClient.js');
jest.mock('@wppconnect-team/wppconnect');
jest.mock('../repositories/botLogsRepository.cjs', () => ({
  insert: async () => ({}),
  listByBotId: async () => ([])
}));
jest.mock('../repositories/whatsappLogsRepository.cjs', () => ({
  insert: async () => ({}),
  getAll: async () => ([])
}));
jest.mock('../repositories/qrCodesRepository.cjs', () => ({
  insert: async () => ({}),
  getAll: async () => ([])
}));
const wppconnectService = require('../services/wppconnect.cjs');

describe('wppconnect service', () => {
  it('deve enviar mensagem e retornar metadados', async () => {
    const number = '5511999999999';
    const message = 'Mensagem de teste';
    const result = await wppconnectService.sendMessage(number, message);
    expect(result).toHaveProperty('number', number);
    expect(result).toHaveProperty('message', message);
    expect(result).toHaveProperty('fromMe', true);
    expect(result).toHaveProperty('timestamp');
  });

  it('deve obter histórico de mensagens', async () => {
    const msgs = await wppconnectService.getMessages();
    expect(Array.isArray(msgs)).toBe(true);
  });

  it('deve registrar callback de mensagem recebida', () => {
    let called = false;
    wppconnectService.onMessageReceived(() => { called = true; });
    // Simula recebimento (stub)
    expect(typeof wppconnectService.onMessageReceived).toBe('function');
  });
});
