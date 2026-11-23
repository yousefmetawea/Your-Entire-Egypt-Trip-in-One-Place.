import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { placesRouter } from './places.routes.js';
import { accommodationRouter, transportRouter, readyMadeTripsRouter } from './catalog.routes.js';
import { tripsRouter, bookingsRouter } from './userResources.routes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/places', placesRouter);
apiRouter.use('/accommodation', accommodationRouter);
apiRouter.use('/transport', transportRouter);
apiRouter.use('/ready-made-trips', readyMadeTripsRouter);
apiRouter.use('/trips', tripsRouter);
apiRouter.use('/bookings', bookingsRouter);
