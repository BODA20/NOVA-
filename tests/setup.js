const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

let mongoServer;

// Extreme timeout for slow environments/downloads
jest.setTimeout(600000);

beforeAll(async () => {
  // Only connect to DB if it's likely an integration test
  // We can check if mongoose is already mocked or if we are in integration folder
  const isIntegration = expect.getState().testPath.includes('integration');
  
  if (isIntegration) {
    try {
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
    } catch (err) {
      console.error('Failed to start MongoMemoryServer:', err);
    }
  }

  process.env.JWT_SECRET = 'test-secret-key-at-least-32-characters-long';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.JWT_COOKIE_EXPIRES_IN = '1';
  process.env.NODE_ENV = 'production';
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
  if (mongoServer) {
    await mongoose.connection.close();
    await mongoServer.stop();
  }
});
