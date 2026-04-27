const bookingService = require('../../../src/services/bookingService');
const Tour = require('../../../src/models/tourModel');
const Booking = require('../../../src/models/bookingModel');
const AppError = require('../../../src/utils/appError');

jest.mock('../../../src/models/tourModel');
jest.mock('../../../src/models/bookingModel');

describe('Booking Service (Unit)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createBooking', () => {
    it('should throw 404 AppError if tour is not found', async () => {
      Tour.findById.mockResolvedValue(null);

      await expect(bookingService.createBooking('user-id', 'invalid-tour-id'))
        .rejects.toThrow(AppError);
        
      try {
        await bookingService.createBooking('user-id', 'invalid-tour-id');
      } catch (err) {
        expect(err.statusCode).toBe(404);
      }
    });

    it('should create a booking successfully', async () => {
      Tour.findById.mockResolvedValue({ _id: 'tour-123', price: 100 });
      Booking.create.mockResolvedValue({ id: 'booking-1', status: 'paid' });

      const result = await bookingService.createBooking('user-123', 'tour-123');

      expect(Tour.findById).toHaveBeenCalledWith('tour-123');
      expect(Booking.create).toHaveBeenCalledWith({
        tour: 'tour-123',
        user: 'user-123',
        price: 100,
        status: 'paid'
      });
      expect(result.status).toBe('paid');
    });

    it('should throw 400 AppError on duplicate key (code 11000)', async () => {
      Tour.findById.mockResolvedValue({ _id: 'tour-123', price: 100 });
      
      const mongoDuplicateError = new Error('Duplicate key error');
      mongoDuplicateError.code = 11000;
      Booking.create.mockRejectedValue(mongoDuplicateError);

      await expect(bookingService.createBooking('user-123', 'tour-123'))
        .rejects.toThrow(AppError);

      try {
        await bookingService.createBooking('user-123', 'tour-123');
      } catch (err) {
        expect(err.statusCode).toBe(400);
        expect(err.message).toBe('You have already booked this tour!');
      }
    });
  });
});
