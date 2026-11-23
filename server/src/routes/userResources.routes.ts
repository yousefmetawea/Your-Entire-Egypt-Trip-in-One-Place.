import { Router } from 'express';
import { TripsController, BookingsController } from '../controllers/api.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import {
  createTripSchema,
  updateTripSchema,
  saveItinerarySchema,
  createBookingRequestSchema,
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

// All booking operations require authentication
bookingsRouter.use(requireAuth);

bookingsRouter.get('/', BookingsController.listMine);
bookingsRouter.get('/:id', BookingsController.getById);
bookingsRouter.post(
  '/',
  validateRequest({ body: createBookingRequestSchema }),
  BookingsController.create,
);
bookingsRouter.post('/:id/cancel', BookingsController.cancel);
bookingsRouter.post('/:id/simulate-confirm', BookingsController.simulateConfirm);
