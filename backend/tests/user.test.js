import request from 'supertest';
import app from '../app.js';

describe('User API', () => {
  let token = '';

  beforeAll(async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'profileuser', email: 'profileuser@example.com', password: 'test1234' });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'profileuser@example.com', password: 'test1234' });
    token = res.body.token;
  });

  it('should get user profile and quiz history', async () => {
    const res = await request(app)
      .get('/api/user/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe('profileuser@example.com');
    expect(Array.isArray(res.body.quizHistory)).toBe(true);
  });
});
