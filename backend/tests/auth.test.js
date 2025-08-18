const request = require('supertest');
const app = require('../index.cjs');

describe('Auth Endpoints', () => {
  it('GET /api/auth/me deve exigir JWT', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
  });
  // Adicione mais testes conforme necessário
});
