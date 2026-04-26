const request = require('supertest');
const User = require('../../src/modules/user/user.model');

/**
 * Creates a user and returns the user object and login token
 */
exports.getAuthCredentials = async (app, role = 'user', email = 'test@example.com') => {
  const password = 'password123';
  const user = await User.create({
    name: 'Test User',
    email,
    password,
    passwordConfirm: password,
    role,
  });

  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({ email, password });

  return {
    user,
    token: res.body.tokens.accessToken,
    refreshToken: res.body.tokens.refreshToken,
  };
};
