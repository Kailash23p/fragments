const request = require('supertest');

const app = require('../../src/app');

const userEmail = 'test-user1@fragments-testing.com';
const userPassword = 'test-password1';

describe('GET /v1/fragments/:id.:ext', () => {
  let markdownId;

  beforeEach(async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth(userEmail, userPassword)
      .set('Content-Type', 'text/markdown')
      .send('# Hello World');

    markdownId = res.body.fragment.id;
  });

  test('unauthenticated requests are denied', () =>
    request(app).get(`/v1/fragments/${markdownId}.html`).expect(401));

  test('markdown fragments can be converted to html', async () => {
    const res = await request(app)
      .get(`/v1/fragments/${markdownId}.html`)
      .auth(userEmail, userPassword);

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/html/);
    expect(res.text).toContain('<h1>Hello World</h1>');
  });

  test('unsupported conversions return 415', async () => {
    const createRes = await request(app)
      .post('/v1/fragments')
      .auth(userEmail, userPassword)
      .set('Content-Type', 'text/plain')
      .send('plain text');

    await request(app)
      .get(`/v1/fragments/${createRes.body.fragment.id}.html`)
      .auth(userEmail, userPassword)
      .expect(415);
  });

  test('unknown fragment id returns 404', () =>
    request(app)
      .get('/v1/fragments/00000000-0000-0000-0000-000000000000.html')
      .auth(userEmail, userPassword)
      .expect(404));
});
