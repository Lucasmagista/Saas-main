
jest.mock('../supabaseClient.js');
jest.mock('../repositories/botsRepository.cjs', () => ({
  update: async () => ({}),
  getById: async () => ({}),
  getAll: async () => ([])
}));
const request = require('supertest');
const app = require('../index.cjs');

describe('Bots Routes', () => {
  it('GET /api/bots/list deve exigir autenticação', async () => {
    const res = await request(app).get('/api/bots/list');
    expect([401, 403, 404]).toContain(res.statusCode);
  });

  it('POST /api/bots deve validar payload', async () => {
    const res = await request(app)
      .post('/api/bots')
      .send({ name: '' });
    expect([400, 401]).toContain(res.statusCode);
  });

  // Adicione mais testes de integração conforme necessário
});
