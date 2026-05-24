const request = require('supertest');

const app = require('../../src/app');

describe('404 handler', () => {
  test('returns a formatted 404 response for unknown routes', async () => {
    const res = await request(app).get('/no-such-route');

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      status: 'error',
      error: {
        code: 404,
        message: 'not found',
      },
    });
  });
});
