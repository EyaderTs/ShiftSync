import { Repository } from 'typeorm';
import QueryConstructor from '../../libs/query-constructor';
import DBContext from '../../../database-context';
import { NotFoundException } from '../../infrastructure/http-exceptions';
import FilterOperators from '../../libs/filter-operators';
import { LocationResponse } from './location-response';
import { LocationEntity } from '../../persistences/locations/location-schema';

export class LocationQuery {
  static async getLocation(id: string, relations: string[] = [], withDeleted: boolean = true) {
    const connection = await DBContext.getConnection();
    const locationRepository: Repository<LocationEntity> = connection.getRepository(LocationEntity);
    const location = await locationRepository.findOne({
      where: { locationId: id },
      relations,
      withDeleted,
    });
    if (!location) {
      throw new NotFoundException(`Location not found`);
    }
    return LocationResponse.toResponse(location);
  }

  static async getLocations(query: any) {
    const connection = await DBContext.getConnection();
    const locationRepository: Repository<LocationEntity> = connection.getRepository(LocationEntity);
    const dataQuery = QueryConstructor.constructQuery(locationRepository, query);
    const apiFormat: { count?: number; data?: any[] } = {};
    
    if (query.count) {
      apiFormat.count = await dataQuery.getCount();
    } else {
      const [result, total] = await dataQuery.getManyAndCount();
      apiFormat.count = total;
      apiFormat.data = result.map((location: any) => LocationResponse.toResponse(location));
    }
    return apiFormat;
  }

  static async getArchivedLocations(query: any) {
    if (!query.filter) {
      query.filter = [];
    }
    query.filter.push([
      {
        field: "archived_at",
        operator: FilterOperators.NotNull,
      },
    ]);
    const connection = await DBContext.getConnection();
    const locationRepository: Repository<LocationEntity> = connection.getRepository(LocationEntity);
    const dataQuery = QueryConstructor.constructQuery(locationRepository, query);
    dataQuery.withDeleted();
    
    const apiFormat: { count?: number; data?: any[] } = {};
    if (query.count) {
      apiFormat.count = await dataQuery.getCount();
    } else {
      const [result, total] = await dataQuery.getManyAndCount();
      apiFormat.count = total;
      apiFormat.data = result.map((location: any) => LocationResponse.toResponse(location));
    }
    return apiFormat;
  }
}
