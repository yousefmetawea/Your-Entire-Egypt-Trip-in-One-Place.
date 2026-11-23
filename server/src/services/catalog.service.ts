import { AccommodationModel, type IAccommodation } from '../models/Accommodation.js';
import { TransportOptionModel, type ITransportOption } from '../models/TransportOption.js';
import { ReadyMadeTripModel, type IReadyMadeTrip } from '../models/ReadyMadeTrip.js';
import { ApiError } from '../errors/ApiError.js';

export class CatalogService {
  // Accommodation
  static async listAccommodation(query: {
    type?: 'hotel' | 'hostel';
    area?: string;
    amenity?: string;
    page?: number;
    limit?: number;
  }): Promise<{ accommodation: IAccommodation[]; total: number }> {
    const filter: Record<string, unknown> = {};
    if (query.type) filter.type = query.type;
    if (query.amenity) filter.amenities = query.amenity;

    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const skip = (page - 1) * limit;

    const [accommodation, total] = await Promise.all([
      AccommodationModel.find(filter).skip(skip).limit(limit),
      AccommodationModel.countDocuments(filter),
    ]);

    return { accommodation, total };
  }

  static async getAccommodationById(id: string): Promise<IAccommodation> {
    const item = await AccommodationModel.findOne({ id });
    if (!item) {
      throw ApiError.notFound(`Accommodation not found: ${id}`);
    }
    return item;
  }

  // Transport
  static async listTransport(query: {
    type?: 'transfer' | 'private-car' | 'bus' | 'metro';
    page?: number;
    limit?: number;
  }): Promise<{ transport: ITransportOption[]; total: number }> {
    const filter: Record<string, unknown> = {};
    if (query.type) filter.type = query.type;

    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const skip = (page - 1) * limit;

    const [transport, total] = await Promise.all([
      TransportOptionModel.find(filter).skip(skip).limit(limit),
      TransportOptionModel.countDocuments(filter),
    ]);

    return { transport, total };
  }

  // Ready-Made Trips
  static async listReadyMadeTrips(): Promise<IReadyMadeTrip[]> {
    return ReadyMadeTripModel.find();
  }

  static async getReadyMadeTripById(id: string): Promise<IReadyMadeTrip> {
    const trip = await ReadyMadeTripModel.findOne({ id });
    if (!trip) {
      throw ApiError.notFound(`Ready-made trip not found: ${id}`);
    }
    return trip;
  }
}
