const request = require('supertest');

const app = require('../../src/app');

describe('GET /v1/fragments', () => {
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(401));

  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  test('authenticated users get a fragments array', async () => {
    const res = await request(app)
      .get('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });

  test('authenticated users can list created fragment ids', async () => {
    const createRes = await request(app)
      .post('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'text/plain')
      .send('listed fragment');

    const listRes = await request(app)
      .get('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1');

    expect(listRes.body.fragments).toContain(createRes.body.fragment.id);
  });

  test('authenticated users can list expanded fragment metadata', async () => {
    const createRes = await request(app)
      .post('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'text/plain')
      .send('expanded fragment');

    const listRes = await request(app)
      .get('/v1/fragments?expand=1')
      .auth('test-user1@fragments-testing.com', 'test-password1');

    const fragment = listRes.body.fragments.find((item) => item.id === createRes.body.fragment.id);
    expect(fragment).toMatchObject({
      type: 'text/plain',
      size: 17,
    });
    expect(fragment.created).toBeTruthy();
    expect(fragment.updated).toBeTruthy();
  });
});
