import { Router } from 'express';
import { CatalogController } from '../controllers/api.controller.js';
import { validateRequest } from '../middleware/validate.js';
import { accommodationQuerySchema, transportQuerySchema } from '../validation/api.validation.js';

export const accommodationRouter = Router();
accommodationRouter.get(
  '/',
  validateRequest({ query: accommodationQuerySchema }),
  CatalogController.listAccommodation,
);
accommodationRouter.get('/:id', CatalogController.getAccommodationById);

export const transportRouter = Router();
transportRouter.get(
  '/',
  validateRequest({ query: transportQuerySchema }),
  CatalogController.listTransport,
);

export const readyMadeTripsRouter = Router();
readyMadeTripsRouter.get('/', CatalogController.listReadyMadeTrips);
readyMadeTripsRouter.get('/:id', CatalogController.getReadyMadeTripById);
