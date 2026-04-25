const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

beforeAll(async () => {
  // Connect to a test database if needed
});

afterAll(async () => {
  await mongoose.connection.close();
});
