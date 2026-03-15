import QueryConstructor from '../../libs/query-constructor';
import DBContext from '../../../database-context';
import { ShiftResponse } from './shift-response';
import { ShiftEntity } from '../../persistences/shifts/shift-schema';
import { NotFoundException } from '../../infrastructure/http-exceptions';
import { BaseRepository } from '../../persistences/base-repository';

export class ShiftQuery {
  
  static async getShifts(query: any) {
    const connection = await DBContext.getConnection();
    const shiftRepository = connection.getRepository(ShiftEntity);
    const dataQuery = QueryConstructor.constructQuery(shiftRepository, query);
    
    const apiFormat: any = {};
    
    if (query.count) {
      apiFormat.count = await dataQuery.getCount();
    } else {
      const [result, total] = await dataQuery.getManyAndCount();
      apiFormat.count = total;
      apiFormat.data = result.map((shift: ShiftEntity) => 
        ShiftResponse.toResponse(shift)
      );
    }
    
    return apiFormat;
  }

  static async getShift(id: string, includes: string[] = [], withDeleted: boolean = true) {
    const shift = await BaseRepository.getByPrimaryKey(
      ShiftEntity,
      'shiftId',
      id,
      includes,
      withDeleted
    );
    
    if (!shift) {
      throw new NotFoundException('Shift not found');
    }
    
    return ShiftResponse.toResponse(shift);
  }
}

export default ShiftQuery;
