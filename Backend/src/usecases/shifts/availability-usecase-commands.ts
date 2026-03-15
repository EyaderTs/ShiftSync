import { BaseRepository } from '../../persistences/base-repository';
import { StaffAvailability } from '../../domains/shift/staff-availability-model';
import { StaffAvailabilityResponse } from './staff-availability-response';
import { NotFoundException, BadRequestException } from '../../infrastructure/http-exceptions';
import { StaffAvailabilityEntity } from '../../persistences/shifts/staff-availability-schema';

export class AvailabilityCommand {
  static async create(availability: Partial<StaffAvailability>): Promise<StaffAvailability> {
    // Validate required fields
    if (!availability.userId) {
      throw new BadRequestException('User ID is required');
    }
    if (!availability.locationId) {
      throw new BadRequestException('Location ID is required');
    }
    if (!availability.type) {
      throw new BadRequestException('Availability type is required');
    }

    // Validate based on type
    if (availability.type === 'recurring') {
      if (availability.dayOfWeek === undefined || availability.dayOfWeek === null) {
        throw new BadRequestException('Day of week is required for recurring availability');
      }
      if (!availability.startTime || !availability.endTime) {
        throw new BadRequestException('Start time and end time are required for recurring availability');
      }
    } else if (availability.type === 'exception') {
      if (!availability.exceptionDate) {
        throw new BadRequestException('Exception date is required for exception availability');
      }
      if (!availability.exceptionStartTimeUtc || !availability.exceptionEndTimeUtc) {
        throw new BadRequestException('Exception start and end times (UTC) are required for exception availability');
      }
    }

    const newAvailability = await BaseRepository.save(StaffAvailabilityEntity, availability);
    return StaffAvailabilityResponse.toResponse(newAvailability);
  }

  static async createBatch(availabilities: Partial<StaffAvailability>[]): Promise<StaffAvailability[]> {
    // Validate each availability
    for (const availability of availabilities) {
      if (!availability.userId) {
        throw new BadRequestException('User ID is required for all availabilities');
      }
      if (!availability.locationId) {
        throw new BadRequestException('Location ID is required for all availabilities');
      }
      if (!availability.type) {
        throw new BadRequestException('Availability type is required for all availabilities');
      }

      if (availability.type === 'recurring') {
        if (availability.dayOfWeek === undefined || availability.dayOfWeek === null) {
          throw new BadRequestException('Day of week is required for recurring availability');
        }
        if (!availability.startTime || !availability.endTime) {
          throw new BadRequestException('Start time and end time are required for recurring availability');
        }
      }
    }

    // Save all availabilities
    const savedAvailabilities = await BaseRepository.saveBatch(StaffAvailabilityEntity, availabilities);
    return savedAvailabilities.map(av => StaffAvailabilityResponse.toResponse(av));
  }

  static async update(availabilityPayload: StaffAvailability): Promise<StaffAvailability> {
    if (!availabilityPayload.availabilityId) {
      throw new BadRequestException('Availability ID is required');
    }

    let availability: StaffAvailabilityEntity | null = await BaseRepository.getByPrimaryKey(
      StaffAvailabilityEntity, 
      'availabilityId', 
      availabilityPayload.availabilityId, 
      [], 
      true
    );
    
    if (!availability) throw new NotFoundException('Availability not found');

    const updatedAvailability = { ...availability, ...availabilityPayload };
    const savedAvailability = await BaseRepository.save(StaffAvailabilityEntity, updatedAvailability);
    return StaffAvailabilityResponse.toResponse(savedAvailability);
  }

  static async delete(id: string): Promise<void> {
    const availability = await BaseRepository.getByPrimaryKey(
      StaffAvailabilityEntity, 
      'availabilityId', 
      id, 
      [], 
      true
    );
    
    if (!availability) throw new NotFoundException('Availability not found');
    await BaseRepository.delete(StaffAvailabilityEntity, id, 'availabilityId');
  }

  static async archive(id: string): Promise<StaffAvailability> {
    const availability = await BaseRepository.getByPrimaryKey(
      StaffAvailabilityEntity, 
      'availabilityId', 
      id, 
      [], 
      true
    );
    
    if (!availability) throw new NotFoundException('Availability not found');
    const result = await BaseRepository.archive(StaffAvailabilityEntity, id, 'availabilityId');
    if (result) availability.archivedAt = new Date();
    return StaffAvailabilityResponse.toResponse(availability);
  }

  static async restore(id: string): Promise<StaffAvailability> {
    const availability = await BaseRepository.getByPrimaryKey(
      StaffAvailabilityEntity, 
      'availabilityId', 
      id, 
      [], 
      true
    );
    
    if (!availability) throw new NotFoundException('Availability not found');
    const result = await BaseRepository.restore(StaffAvailabilityEntity, id, 'availabilityId');
    if (result) availability.archivedAt = undefined;
    return StaffAvailabilityResponse.toResponse(availability);
  }
}
