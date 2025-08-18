const request = require('supertest');
const app = require('../index.cjs');

describe('Audit Export', () => {
  it('GET /api/audit/export?format=json deve exigir JWT', async () => {
    const res = await request(app).get('/api/audit/export?format=json');
    expect(res.statusCode).toBe(401);
  });
  it('GET /api/audit/export?format=csv deve exigir JWT', async () => {
    const res = await request(app).get('/api/audit/export?format=csv');
    expect(res.statusCode).toBe(401);
  });
});
