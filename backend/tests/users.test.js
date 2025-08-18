const request = require('supertest');
const app = require('../index.cjs');

describe('Users Endpoints', () => {
  it('GET /api/users/list deve exigir JWT', async () => {
    const res = await request(app).get('/api/users/list');
    expect(res.statusCode).toBe(401);
  });
  // Adicione mais testes conforme necessário
});
