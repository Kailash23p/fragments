const request = require('supertest');

const hash = require('../../src/hash');
const app = require('../../src/app');

const userEmail = 'test-user1@fragments-testing.com';
const userPassword = 'test-password1';
const ownerId = hash(userEmail);

describe('GET /v1/fragments/:id/info', () => {
  let fragmentId;

  beforeEach(async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth(userEmail, userPassword)
      .set('Content-Type', 'text/plain')
      .send('fragment metadata test');

    fragmentId = res.body.fragment.id;
  });

  test('unauthenticated requests are denied', () =>
    request(app).get(`/v1/fragments/${fragmentId}/info`).expect(401));

  test('authenticated users can retrieve fragment metadata', async () => {
    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}/info`)
      .auth(userEmail, userPassword);

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment).toMatchObject({
      id: fragmentId,
      ownerId,
      type: 'text/plain',
      size: 22,
    });
    expect(res.body.fragment.created).toBeDefined();
    expect(res.body.fragment.updated).toBeDefined();
  });

  test('unknown fragment id returns 404', () =>
    request(app)
      .get('/v1/fragments/00000000-0000-0000-0000-000000000000/info')
      .auth(userEmail, userPassword)
      .expect(404));
});
