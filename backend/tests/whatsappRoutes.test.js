
jest.mock('../supabaseClient.js');
jest.mock('@wppconnect-team/wppconnect');
jest.mock('../repositories/whatsappLogsRepository.cjs', () => ({
  insert: async () => ({}),
  getAll: async () => ([])
}));
jest.mock('../repositories/qrCodesRepository.cjs', () => ({
  insert: async () => ({}),
  getAll: async () => ([])
}));

// Mock authentication middleware
jest.mock('../middleware/authenticateJWT.cjs', () => (req, res, next) => {
  req.user = { id: 'test-user-id' };
  next();
});

const request = require('supertest');
const app = require('../index.cjs');

describe('WhatsApp Routes', () => {
  it('POST /api/whatsapp/send deve validar payload', async () => {
    const res = await request(app)
      .post('/api/whatsapp/send')
      .set('Authorization', 'Bearer test-token')
      .send({ number: '', message: '' });
    expect(res.statusCode).toBe(400);
  });

  it('POST /api/whatsapp/send deve enviar mensagem', async () => {
    const res = await request(app)
      .post('/api/whatsapp/send')
      .set('Authorization', 'Bearer test-token')
      .send({ number: '5511999999999', message: 'Olá!' });
    expect([200, 201]).toContain(res.statusCode);
    expect(res.body).toHaveProperty('number');
    expect(res.body).toHaveProperty('message');
  });

  it('GET /api/whatsapp/messages deve retornar histórico', async () => {
    const res = await request(app)
      .get('/api/whatsapp/messages')
      .set('Authorization', 'Bearer test-token');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
