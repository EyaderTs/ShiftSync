import { BaseRepository } from '../../persistences/base-repository';
import { Location } from 'src/domains/location/location-model';
import { LocationResponse } from './location-response';
import { NotFoundException } from '../../infrastructure/http-exceptions';
// import { DefinedLocations } from '../../domains/locations/defined-locations';
// import DBContext from 'database-context';
// import { EntityManager } from 'typeorm';
import { LocationEntity } from '../../persistences/locations/location-schema';

export class LocationCommand {
  static async create(location: Partial<Location>): Promise<LocationResponse> {
    const data = await BaseRepository.save(LocationEntity, location);
    return LocationResponse.toResponse(data);
  }

  static async update(locationPayload: Location) {
    let location = await BaseRepository.getByPrimaryKey(
      LocationEntity,
      'locationId',
      locationPayload.locationId,
      [],
      true
    );
    if (!location) throw new NotFoundException('Location not found');
    location = { ...location, ...locationPayload };
    const newLocation = await BaseRepository.save(LocationEntity, location);
    return LocationResponse.toResponse(newLocation);
  }

  static async delete(id: string): Promise<void> {
    const location = await BaseRepository.getByPrimaryKey(
      LocationEntity,
      'locationId',
      id,
      [],
      true
    );
    if (!location) throw new NotFoundException('Location not found');
     await BaseRepository.delete(LocationEntity, id, 'locationId');
  }

  static async archive(id: string): Promise<LocationResponse> {
    const location = await BaseRepository.getByPrimaryKey(LocationEntity, 'locationId', id);
    if (!location) throw new NotFoundException('Location not found');
    const result = await BaseRepository.archive(LocationEntity, id, 'locationId');
    if (result) location.archivedAt = new Date();
    return LocationResponse.toResponse(location);
  }

  static async restore(id: string): Promise<LocationResponse> {
    const location = await BaseRepository.getByPrimaryKey(
      LocationEntity,
      'locationId',
      id,
      [],
      true
    );
    if (!location) throw new NotFoundException('Location not found');
    const result = await BaseRepository.restore(LocationEntity, id, 'locationId');
    if (result) location.archivedAt = undefined;
    return LocationResponse.toResponse(location);
  }

//   static async seed(): Promise<LocationResponse[]> {
//     const response: LocationResponse[] = [];
//     for await (const location of DefinedLocations) {
//       const existingLocation = await BaseRepository.getItemByCustomFieldAndOrganizationId(
//         LocationEntity,
//         'location_name',
//         location.name,
//         [],
//         true
//       );
//       if (!existingLocation) {
//         console.log('try create location ' + location.name);
//         const data = await BaseRepository.save(LocationEntity, {
//           location_name: location.name,
//           description: location.description,
//           key: location.key,
//         });
//         response.push(LocationResponse.toResponse(data));
//       }
//     }
//     return response;
//   }

//   static async seedLocationInTransactionMode(transactionManager: EntityManager): Promise<LocationResponse[]> {
//     const response: LocationResponse[] = [];
//     const dataSource = await DBContext.getConnection();
//     const locationRepository = dataSource.getRepository(LocationEntity);

//     for await (const location of DefinedLocations) {
//       const existingLocation = await BaseRepository.getItemByCustomFieldAndOrganizationId(
//         LocationEntity,
//         'location_name',
//         location.name,
//         [],
//         true
//       );
//       if (!existingLocation) {
//         console.log('try create location ' + location.name);
//         const newLocation = {
//           location_name: location.name,
//           description: location.description,
//           key: location.key,
//         };
//         const newLocationItem = locationRepository.create(newLocation);
//         const data = await transactionManager.save(newLocationItem);
//         response.push(LocationResponse.toResponse(data));
//       }
//     }
//     return response;
//   }
}
