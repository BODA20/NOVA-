const request = require('supertest');
const app = require('../../src/app');
const { createTestUser, createTestTour } = require('../helpers/testDataFactory');

describe('Tours API (Integration)', () => {
  describe('GET /api/v1/tours', () => {
    it('should return all tours with 200 status', async () => {
      await createTestTour({ name: 'Tour 1' });
      await createTestTour({ name: 'Tour 2' });

      const res = await request(app).get('/api/v1/tours').expect(200);

      expect(res.body.status).toBe('success');
      expect(res.body.results).toBe(2);
      expect(res.body.data.tours).toHaveLength(2);
    });
  });

  describe('POST /api/v1/tours', () => {
    it('should create a tour if user is admin', async () => {
      const admin = await createTestUser({ role: 'admin' });
      const token = global.signTestToken(admin._id);

      const res = await request(app)
        .post('/api/v1/tours')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'New Admin Tour',
          duration: 5,
          maxGroupSize: 10,
          difficulty: 'easy',
          price: 397,
          summary: 'A test tour',
          description: 'Detailed desc',
          imageCover: 'tour-1.jpg'
        })
        .expect(201);

      expect(res.body.status).toBe('success');
      expect(res.body.data.tour.name).toBe('New Admin Tour');
    });
  });
});
