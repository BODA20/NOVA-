const request = require('supertest');
const app = require('../../src/app');
const { createTestUser, createTestTour, createTestBooking } = require('../helpers/testDataFactory');

describe('Bookings API (Integration)', () => {
  let user, token, tour;

  beforeEach(async () => {
    user = await createTestUser();
    token = global.signTestToken(user._id);
    tour = await createTestTour();
  });

  describe('POST /api/v1/bookings', () => {
    it('should create a new booking for a user', async () => {
      const res = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send({ tourId: tour._id })
        .expect(201);

      expect(res.body.status).toBe('success');
      expect(res.body.data.booking.tour.toString()).toBe(tour._id.toString());
      expect(res.body.data.booking.user.toString()).toBe(user._id.toString());
      expect(res.body.data.booking.status).toBe('paid');
    });

    it('should fail if user tries to book the same tour twice', async () => {
      await createTestBooking(user, tour);

      const res = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send({ tourId: tour._id })
        .expect(400);

      expect(res.body.message).toMatch(/already booked/);
    });
  });

  describe('GET /api/v1/bookings/my-bookings', () => {
    it('should return only the bookings for the logged in user', async () => {
      const user2 = await createTestUser({ email: 'other@example.com' });
      const tour2 = await createTestTour({ name: 'Other Tour' });

      await createTestBooking(user, tour);
      await createTestBooking(user2, tour2); // Other user's booking

      const res = await request(app)
        .get('/api/v1/bookings/my-bookings')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.results).toBe(1);
      // It should populate the tour
      expect(res.body.data.bookings[0].tour._id.toString()).toBe(tour._id.toString());
    });
  });
});
