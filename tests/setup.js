const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

// Load env vars
dotenv.config({ path: './.env' });

let mongoServer;

// Extreme timeout for slow environments/downloads
jest.setTimeout(600000);

beforeAll(async () => {
  const testPath = expect.getState().testPath || '';
  const isUnitTest = testPath.includes('unit');
  
  if (!isUnitTest) {
    try {
      mongoServer = await MongoMemoryServer.create({
        binary: {
          version: '6.0.8', // Explicit version can be more stable
        },
      });
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
    } catch (err) {
      console.error('Failed to start MongoMemoryServer. Details:', err);
      console.error('Error stack:', err.stack);
      process.exit(1);
    }
  }

  process.env.JWT_SECRET = 'test-secret-key-at-least-32-characters-long';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.JWT_COOKIE_EXPIRES_IN = '1';
  process.env.NODE_ENV = 'test';
});

beforeEach(async () => {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany();
    }
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

// Global Test Helper for JWT
global.signTestToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Mock Email class to prevent hanging during tests
jest.mock('./../src/utils/email', () => {
  return class Email {
    constructor() {}
    send() { return Promise.resolve(); }
    sendVerification() { return Promise.resolve(); }
    sendPasswordReset() { return Promise.resolve(); }
    sendEmailChangeVerification() { return Promise.resolve(); }
  };
});
