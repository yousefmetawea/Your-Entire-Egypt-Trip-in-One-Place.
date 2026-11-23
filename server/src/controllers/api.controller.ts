import type { Request, Response, NextFunction } from 'express';
import { PlacesService, type PlaceFilterQuery } from '../services/places.service.js';
import { CatalogService } from '../services/catalog.service.js';
import { TripsService } from '../services/trips.service.js';
import { BookingsService } from '../services/bookings.service.js';

// Places
export class PlacesController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await PlacesService.list(req.query as unknown as PlaceFilterQuery);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const place = await PlacesService.getBySlug(req.params.slug as string);
      res.status(200).json({ place });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const place = await PlacesService.getById(req.params.id as string);
      res.status(200).json({ place });
    } catch (error) {
      next(error);
    }
  }

  static async getNearby(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 3;
      const nearby = await PlacesService.getNearby(req.params.id as string, limit);
      res.status(200).json({ places: nearby });
    } catch (error) {
      next(error);
    }
  }
}

// Catalog (Accommodation, Transport, ReadyMadeTrips)
export class CatalogController {
  static async listAccommodation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await CatalogService.listAccommodation(req.query as Record<string, never>);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async getAccommodationById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const accommodation = await CatalogService.getAccommodationById(req.params.id as string);
      res.status(200).json({ accommodation });
    } catch (error) {
      next(error);
    }
  }

  static async listTransport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await CatalogService.listTransport(req.query as Record<string, never>);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async listReadyMadeTrips(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const trips = await CatalogService.listReadyMadeTrips();
      res.status(200).json({ trips });
    } catch (error) {
      next(error);
    }
  }

  static async getReadyMadeTripById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const trip = await CatalogService.getReadyMadeTripById(req.params.id as string);
      res.status(200).json({ trip });
    } catch (error) {
      next(error);
    }
  }
}

// Trips
export class TripsController {
  static async listMine(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const trips = await TripsService.listUserTrips(req.user!.userId);
      res.status(200).json({ trips });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const trip = await TripsService.getUserTripById(req.params.id as string, req.user!.userId);
      res.status(200).json({ trip });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const trip = await TripsService.createTrip(req.user!.userId, req.body);
      res.status(201).json({ trip });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const trip = await TripsService.updateTrip(
        req.params.id as string,
        req.user!.userId,
        req.body,
      );
      res.status(200).json({ trip });
    } catch (error) {
      next(error);
    }
  }

  static async saveItinerary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const trip = await TripsService.saveItinerary(
        req.params.id as string,
        req.user!.userId,
        req.body,
      );
      res.status(200).json({ trip });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await TripsService.deleteTrip(req.params.id as string, req.user!.userId);
      res.status(200).json({ message: 'Trip deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async addPlaceToDraft(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await TripsService.addPlaceToDraft(
        req.user!.userId,
        req.body.placeId as string,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

// Bookings
export class BookingsController {
  static async listMine(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const bookings = await BookingsService.listUserBookings(req.user!.userId);
      res.status(200).json({ bookings });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const booking = await BookingsService.getUserBookingById(
        req.params.id as string,
        req.user!.userId,
      );
      res.status(200).json({ booking });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const booking = await BookingsService.createBooking(req.user!.userId, req.body);
      res.status(201).json({ booking });
    } catch (error) {
      next(error);
    }
  }

  static async cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const booking = await BookingsService.cancelBooking(
        req.params.id as string,
        req.user!.userId,
      );
      res.status(200).json({ booking });
    } catch (error) {
      next(error);
    }
  }

  static async simulateConfirm(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const booking = await BookingsService.simulateConfirm(
        req.params.id as string,
        req.user!.userId,
      );
      res.status(200).json({ booking });
    } catch (error) {
      next(error);
    }
  }
}
