import { PlaceModel, type IPlace, type PlaceArea } from '../models/Place.js';
import { ApiError } from '../errors/ApiError.js';

export interface PlaceFilterQuery {
  search?: string;
  area?: PlaceArea;
  category?: 'history' | 'culture' | 'adventure' | 'food';
  page?: number;
  limit?: number;
}

export class PlacesService {
  static async list(query: PlaceFilterQuery): Promise<{ places: IPlace[]; total: number }> {
    const filter: Record<string, unknown> = {};

    if (query.area) {
      filter.area = query.area;
    }

    if (query.category) {
      filter.category = query.category;
    }

    if (query.search && query.search.trim().length > 0) {
      filter.$text = { $search: query.search.trim() };
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const skip = (page - 1) * limit;

    const [places, total] = await Promise.all([
      PlaceModel.find(filter).skip(skip).limit(limit),
      PlaceModel.countDocuments(filter),
    ]);

    return { places, total };
  }

  static async getById(id: string): Promise<IPlace> {
    const place = await PlaceModel.findOne({ id });
    if (!place) {
      throw ApiError.notFound(`Place not found: ${id}`);
    }
    return place;
  }

  static async getBySlug(slug: string): Promise<IPlace> {
    const place = await PlaceModel.findOne({ slug });
    if (!place) {
      throw ApiError.notFound(`Place not found with slug: ${slug}`);
    }
    return place;
  }

  static async getNearby(placeId: string, limit = 3): Promise<IPlace[]> {
    const currentPlace = await this.getById(placeId);
    if (!currentPlace.nearbyPlaceIds || currentPlace.nearbyPlaceIds.length === 0) {
      return [];
    }

    const nearbyIds = currentPlace.nearbyPlaceIds.slice(0, limit);
    return PlaceModel.find({ id: { $in: nearbyIds } });
  }
}
