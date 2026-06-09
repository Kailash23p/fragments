const request = require('supertest');

const hash = require('../../src/hash');
const app = require('../../src/app');

const userEmail = 'test-user1@fragments-testing.com';
const userPassword = 'test-password1';
const ownerId = hash(userEmail);

describe('POST /v1/fragments', () => {
  test('unauthenticated requests are denied', () =>
    request(app).post('/v1/fragments').send('hello').expect(401));

  test('incorrect credentials are denied', () =>
    request(app)
      .post('/v1/fragments')
      .auth('invalid@email.com', 'incorrect_password')
      .set('Content-Type', 'text/plain')
      .send('hello')
      .expect(401));

  test('unsupported content types are rejected', () =>
    request(app)
      .post('/v1/fragments')
      .auth(userEmail, userPassword)
      .set('Content-Type', 'application/json')
      .send('{"a":1}')
      .expect(415));

  test('authenticated users can create a plain text fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth(userEmail, userPassword)
      .set('Content-Type', 'text/plain')
      .send('This is a fragment');

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment).toMatchObject({
      ownerId,
      type: 'text/plain',
      size: 18,
    });
    expect(res.body.fragment.id).toBeTruthy();
    expect(res.body.fragment.created).toBeTruthy();
    expect(res.body.fragment.updated).toBeTruthy();
    expect(res.headers.location).toMatch(/\/v1\/fragments\/[0-9a-f-]+$/);
  });

  test('missing body data returns 400', () =>
    request(app)
      .post('/v1/fragments')
      .auth(userEmail, userPassword)
      .set('Content-Type', 'text/plain')
      .expect(400));
});
