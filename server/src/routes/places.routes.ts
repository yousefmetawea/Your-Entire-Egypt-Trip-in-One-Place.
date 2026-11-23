import { Router } from 'express';
import { PlacesController } from '../controllers/api.controller.js';
import { validateRequest } from '../middleware/validate.js';
import { placeQuerySchema } from '../validation/api.validation.js';

export const placesRouter = Router();

placesRouter.get('/', validateRequest({ query: placeQuerySchema }), PlacesController.list);
placesRouter.get('/slug/:slug', PlacesController.getBySlug);
placesRouter.get('/:id', PlacesController.getById);
placesRouter.get('/:id/nearby', PlacesController.getNearby);
