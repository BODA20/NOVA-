const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/userModel');

describe('Authentication Flow (Integration)', () => {
  const testUser = {
    name: 'Auth Test User',
    email: 'authtest@example.com',
    password: 'password123',
    passwordConfirm: 'password123'
  };

  it('should successfully signup a new user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send(testUser)
      .expect(201);

    expect(res.body.status).toBe('success');
    expect(res.body.message).toBe('Token sent to email!');
    
    // Check if user is in DB
    const userInDb = await User.findOne({ email: testUser.email });
    expect(userInDb).toBeTruthy();
    expect(userInDb.emailVerified).toBe(false); // Initially false
  });

  it('should not allow login without verified email', async () => {
    await User.create(testUser); // Create user

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(401);

    expect(res.body.message).toMatch(/Please verify your email/);
  });

  it('should successfully login verified user', async () => {
    const user = await User.create({ ...testUser, emailVerified: true });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(200);

    expect(res.body.status).toBe('success');
    expect(res.body.token).toBeDefined();
    expect(res.body.data.user.email).toBe(testUser.email);
    // Ensure password is not leaked
    expect(res.body.data.user.password).toBeUndefined();
  });

  it('should reject login with wrong password', async () => {
    await User.create({ ...testUser, emailVerified: true });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: testUser.email, password: 'wrongpassword' })
      .expect(401);

    expect(res.body.message).toMatch(/Incorrect email or password/);
  });
});
