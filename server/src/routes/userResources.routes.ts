import { Router } from 'express';
import {
  TripsController,
  BookingsController,
  AdminBookingsController,
} from '../controllers/api.controller.js';
import { requireAuth, optionalAuth, requireRole } from '../middleware/auth.js';
import { bookingRateLimiter } from '../middleware/rateLimiter.js';
import { validateRequest } from '../middleware/validate.js';
import {
  createTripSchema,
  updateTripSchema,
  saveItinerarySchema,
  createBookingRequestSchema,
  trackBookingSchema,
  adminBookingQuerySchema,
  adminSetStatusSchema,
} from '../validation/api.validation.js';

export const tripsRouter = Router();

// All trip operations require authentication
tripsRouter.use(requireAuth);

tripsRouter.get('/', TripsController.listMine);
tripsRouter.get('/:id', TripsController.getById);
tripsRouter.post('/', validateRequest({ body: createTripSchema }), TripsController.create);
tripsRouter.patch('/:id', validateRequest({ body: updateTripSchema }), TripsController.update);
tripsRouter.put(
  '/:id/itinerary',
  validateRequest({ body: saveItinerarySchema }),
  TripsController.saveItinerary,
);
tripsRouter.delete('/:id', TripsController.delete);
tripsRouter.post('/draft/place', TripsController.addPlaceToDraft);

export const bookingsRouter = Router();

// Guests may submit and track a request with a reference code and phone number.
bookingsRouter.post(
  '/',
  bookingRateLimiter,
  optionalAuth,
  validateRequest({ body: createBookingRequestSchema }),
  BookingsController.create,
);
bookingsRouter.post(
  '/track',
  bookingRateLimiter,
  validateRequest({ body: trackBookingSchema }),
  BookingsController.track,
);
bookingsRouter.post(
  '/track/cancel',
  bookingRateLimiter,
  validateRequest({ body: trackBookingSchema }),
  BookingsController.cancelTracked,
);

// Everything below needs a signed-in account.
bookingsRouter.use(requireAuth);
bookingsRouter.get('/', BookingsController.listMine);
bookingsRouter.get('/:id', BookingsController.getById);
bookingsRouter.post('/:id/cancel', BookingsController.cancel);

// Operator routes: admin role only.
export const adminBookingsRouter = Router();
adminBookingsRouter.use(requireAuth, requireRole(['admin']));
adminBookingsRouter.get(
  '/',
  validateRequest({ query: adminBookingQuerySchema }),
  AdminBookingsController.list,
);
adminBookingsRouter.patch(
  '/:id/status',
  validateRequest({ body: adminSetStatusSchema }),
  AdminBookingsController.setStatus,
);
