const request = require('supertest');
const app = require('../../src/app');
const { createTestUser } = require('../helpers/testDataFactory');

describe('Security Protections & Authorization (Integration)', () => {
  it('should prevent access to protected route without token', async () => {
    const res = await request(app)
      .post('/api/v1/tours')
      .send({})
      .expect(401);
      
    expect(res.body.message).toMatch(/You are not logged in/);
  });

  it('should prevent access with invalid token', async () => {
    const res = await request(app)
      .post('/api/v1/tours')
      .set('Authorization', 'Bearer invalid.token.here')
      .send({})
      .expect(401);

    expect(res.body.message).toMatch(/Invalid token/);
  });

  it('should enforce Role-Based Access Control (RBAC)', async () => {
    const user = await createTestUser({ role: 'user' });
    const token = global.signTestToken(user._id);

    const res = await request(app)
      .post('/api/v1/tours')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Hacked Tour' })
      .expect(403);

    expect(res.body.message).toMatch(/You do not have permission/);
  });

  it('should sanitize body against NoSQL injection', async () => {
    // Attempting NoSQL injection via login email field
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: { "$gt": "" },
        password: "password123"
      })
      .expect(400); // Express validation or sanitization removes $gt

    // Message will either be missing email validation or sanitize
    // As long as it is 400 and not 200 or 500, it's safe.
  });
});
