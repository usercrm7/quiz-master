import request from 'supertest';
import app from '../app.js';

describe('Quiz API', () => {
  let token = '';
  let quizId = '';

  beforeAll(async () => {
    // Test için kullanıcı kaydı ve login
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser', email: 'testuser@example.com', password: 'test1234' });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'testuser@example.com', password: 'test1234' });
    token = res.body.token;
  });

  it('should create a quiz', async () => {
    const res = await request(app)
      .post('/api/quiz')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Quiz',
        description: 'Açıklama',
        questions: [
          { text: 'Soru 1', options: ['A', 'B', 'C', 'D'], correctIndex: 0 }
        ]
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Test Quiz');
    quizId = res.body._id;
  });

  it('should get quiz list', async () => {
    const res = await request(app).get('/api/quiz');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get quiz detail', async () => {
    const res = await request(app).get(`/api/quiz/${quizId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(quizId);
  });
});
