const request = require('supertest');
const app = require('../src/app');
const User = require('../src/modules/user/user.model');
const Session = require('../src/modules/auth/session.model');

describe('Auth Module', () => {
  beforeEach(async () => {
    await User.deleteMany();
    await Session.deleteMany();
  });

  describe('POST /api/v1/auth/signup', () => {
    it('should create a new user and return tokens', async () => {
      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          passwordConfirm: 'password123',
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.status).toEqual('success');
      expect(res.body.tokens).toHaveProperty('accessToken');
      expect(res.body.tokens).toHaveProperty('refreshToken');
    });
  });
});
