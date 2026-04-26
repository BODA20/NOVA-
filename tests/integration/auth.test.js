const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/modules/user/user.model');

describe('Authentication Integration Tests', () => {
  const userData = {
    name: 'Auth Test',
    email: 'authtest@example.com',
    password: 'password123',
    passwordConfirm: 'password123',
  };

  describe('POST /api/v1/auth/signup', () => {
    it('should successfully sign up a new user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send(userData);

      expect(res.status).toBe(201);
      expect(res.body.tokens).toHaveProperty('accessToken');
      expect(res.body.data.user.email).toBe(userData.email);
      
      const user = await User.findOne({ email: userData.email });
      expect(user).toBeDefined();
    });

    it('should fail with duplicate email', async () => {
      await User.create(userData);

      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send(userData);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Duplicate');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await User.create(userData);
    });

    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: userData.email,
          password: userData.password,
        });

      expect(res.status).toBe(200);
      expect(res.body.tokens).toHaveProperty('accessToken');
    });

    it('should fail with incorrect password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: userData.email,
          password: 'wrongpassword',
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Incorrect');
    });
  });
});
