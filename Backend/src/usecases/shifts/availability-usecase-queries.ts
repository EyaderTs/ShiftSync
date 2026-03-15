import QueryConstructor from '../../libs/query-constructor';
import DBContext from '../../../database-context';
import { StaffAvailabilityResponse } from './staff-availability-response';
import { StaffAvailabilityEntity } from '../../persistences/shifts/staff-availability-schema';
import { NotFoundException } from '../../infrastructure/http-exceptions';
import { BaseRepository } from '../../persistences/base-repository';

export class AvailabilityQuery {
  
  static async getAvailabilities(query: any) {
    const connection = await DBContext.getConnection();
    const availabilityRepository = connection.getRepository(StaffAvailabilityEntity);
    const dataQuery = QueryConstructor.constructQuery(availabilityRepository, query);
    
    const apiFormat: any = {};
    
    if (query.count) {
      apiFormat.count = await dataQuery.getCount();
    } else {
      const [result, total] = await dataQuery.getManyAndCount();
      apiFormat.count = total;
      apiFormat.data = result.map((availability: StaffAvailabilityEntity) => 
        StaffAvailabilityResponse.toResponse(availability)
      );
    }
    
    return apiFormat;
  }

  static async getAvailability(id: string, includes: string[] = [], withDeleted: boolean = true) {
    const availability = await BaseRepository.getByPrimaryKey(
      StaffAvailabilityEntity,
      'availabilityId',
      id,
      includes,
      withDeleted
    );
    
    if (!availability) {
      throw new NotFoundException('Availability not found');
    }
    
    return StaffAvailabilityResponse.toResponse(availability);
  }
}

export default AvailabilityQuery;
