const request = require('supertest');

const hash = require('../../src/hash');
const app = require('../../src/app');

const userEmail = 'test-user1@fragments-testing.com';
const userPassword = 'test-password1';
const ownerId = hash(userEmail);

describe('GET /v1/fragments/:id', () => {
  let fragmentId;

  beforeEach(async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth(userEmail, userPassword)
      .set('Content-Type', 'text/plain')
      .send('fragment data');

    fragmentId = res.body.fragment.id;
  });

  test('unauthenticated requests are denied', () =>
    request(app).get(`/v1/fragments/${fragmentId}`).expect(401));

  test('authenticated users can retrieve fragment data', async () => {
    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}`)
      .auth(userEmail, userPassword);

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/plain/);
    expect(res.text).toBe('fragment data');
  });

  test('unknown fragment id returns 404', () =>
    request(app)
      .get('/v1/fragments/00000000-0000-0000-0000-000000000000')
      .auth(userEmail, userPassword)
      .expect(404));

  test('created fragment metadata matches owner', async () => {
    const listRes = await request(app)
      .get('/v1/fragments?expand=1')
      .auth(userEmail, userPassword);

    const fragment = listRes.body.fragments.find((item) => item.id === fragmentId);
    expect(fragment).toMatchObject({
      id: fragmentId,
      ownerId,
      type: 'text/plain',
      size: 13,
    });
  });
});
