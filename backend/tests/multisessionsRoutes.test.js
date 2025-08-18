
jest.mock('../supabaseClient.js');
jest.mock('../repositories/multisessionsRepository.cjs', () => ({
  insert: async () => ({}),
  update: async () => ({}),
  getById: async () => ({}),
  getAll: async () => ([])
}));
const request = require('supertest');
const app = require('../index.cjs');

describe('Multisessions Routes', () => {
  it('GET /api/multisessions deve exigir autenticação', async () => {
    const res = await request(app).get('/api/multisessions');
    expect([401, 403]).toContain(res.statusCode);
  });

  it('POST /api/multisessions deve validar payload', async () => {
    const res = await request(app)
      .post('/api/multisessions')
      .send({ session_name: '' });
    expect([400, 401]).toContain(res.statusCode);
  });

  // Adicione mais testes de integração conforme necessário
});
