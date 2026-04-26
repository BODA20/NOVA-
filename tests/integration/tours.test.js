const request = require('supertest');
const app = require('../../src/app');
const Tour = require('../../src/modules/tour/tour.model');
const { getAuthCredentials } = require('../helpers/authHelper');

describe('Tours Module Integration Tests', () => {
  let adminToken;
  let userToken;

  const tourData = {
    name: 'The Sea Explorer',
    duration: 7,
    maxGroupSize: 15,
    difficulty: 'medium',
    price: 497,
    summary: 'Exploring the Mediterranean sea',
    imageCover: 'tour-2-cover.jpg',
    startLocation: {
        type: 'Point',
        coordinates: [2.1734, 41.3851],
        address: 'Barcelona, Spain',
        description: 'Barcelona Harbor',
      },
  };

  beforeEach(async () => {
    const adminCreds = await getAuthCredentials(app, 'admin', 'admin@example.com');
    adminToken = adminCreds.token;

    const userCreds = await getAuthCredentials(app, 'user', 'user@example.com');
    userToken = userCreds.token;
  });

  describe('GET /api/v1/tours', () => {
    it('should return all tours', async () => {
      await Tour.create(tourData);
      
      const res = await request(app).get('/api/v1/tours');
      
      expect(res.status).toBe(200);
      expect(res.body.data.tours).toHaveLength(1);
    });
  });

  describe('POST /api/v1/tours', () => {
    it('should allow admin to create a tour', async () => {
      const res = await request(app)
        .post('/api/v1/tours')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(tourData);

      expect(res.status).toBe(201);
      expect(res.body.data.tour.name).toBe(tourData.name);
    });

    it('should deny regular user from creating a tour', async () => {
      const res = await request(app)
        .post('/api/v1/tours')
        .set('Authorization', `Bearer ${userToken}`)
        .send(tourData);

      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/v1/tours/:id', () => {
    it('should allow admin to delete a tour', async () => {
      const tour = await Tour.create(tourData);

      const res = await request(app)
        .delete(`/api/v1/tours/${tour._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(204);
      
      const deletedTour = await Tour.findById(tour._id);
      expect(deletedTour).toBeNull();
    });

    it('should return 404 for non-existent tour', async () => {
      const id = new (require('mongoose')).Types.ObjectId();
      const res = await request(app)
        .delete(`/api/v1/tours/${id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });
});
