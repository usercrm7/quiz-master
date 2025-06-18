import request from 'supertest';
import app from '../app.js';

describe('Auth API', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'authuser', email: 'authuser@example.com', password: 'test1234' });
    expect([200, 201, 409]).toContain(res.statusCode); // 409: kullanıcı zaten varsa
  });

  it('should login with registered user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'authuser@example.com', password: 'test1234' });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});
