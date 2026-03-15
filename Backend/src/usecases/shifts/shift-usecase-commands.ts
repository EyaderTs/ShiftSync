import { BaseRepository } from '../../persistences/base-repository';
import { Shift } from '../../domains/shift/shift-model';
import { ShiftResponse } from './shift-response';
import { NotFoundException, BadRequestException } from '../../infrastructure/http-exceptions';
import { ShiftEntity } from '../../persistences/shifts/shift-schema';
import { ShiftAssignmentEntity } from '../../persistences/shifts/shift-assignment-schema';
import { StaffAvailabilityEntity } from '../../persistences/shifts/staff-availability-schema';
import { LocationEntity } from '../../persistences/locations/location-schema';
import { ShiftAssignmentResponse } from './shift-assignment-response';
import DBContext from '../../../database-context';

export class ShiftCommand {
  static async create(shift: Partial<Shift>): Promise<Shift> {
    // Validate required fields
    if (!shift.locationId) {
      throw new BadRequestException('Location ID is required');
    }
    if (!shift.skillId) {
      throw new BadRequestException('Skill ID is required');
    }
    if (!shift.requiredHeadcount || shift.requiredHeadcount < 1) {
      throw new BadRequestException('Required headcount must be at least 1');
    }
    if (!shift.startTimeUtc) {
      throw new BadRequestException('Start time is required');
    }
    if (!shift.endTimeUtc) {
      throw new BadRequestException('End time is required');
    }

    // Validate that end time is after start time
    const startTime = new Date(shift.startTimeUtc);
    const endTime = new Date(shift.endTimeUtc);
    if (endTime <= startTime) {
      throw new BadRequestException('End time must be after start time');
    }

    // Set default status if not provided
    if (!shift.status) {
      shift.status = 'draft';
    }

    // Set cutoff time to 48 hours before shift start if not provided
    if (!shift.cutoffTimeUtc) {
      const cutoffTime = new Date(startTime);
      cutoffTime.setHours(cutoffTime.getHours() - 48);
      shift.cutoffTimeUtc = cutoffTime;
    }

    const newShift = await BaseRepository.save(ShiftEntity, shift);
    return ShiftResponse.toResponse(newShift);
  }

  static async update(shiftPayload: Shift): Promise<Shift> {
    if (!shiftPayload.shiftId) {
      throw new BadRequestException('Shift ID is required');
    }

    let shift: ShiftEntity | null = await BaseRepository.getByPrimaryKey(
      ShiftEntity, 
      'shiftId', 
      shiftPayload.shiftId, 
      [], 
      true
    );
    
    if (!shift) throw new NotFoundException('Shift not found');

    // Validate time changes if provided
    if (shiftPayload.startTimeUtc && shiftPayload.endTimeUtc) {
      const startTime = new Date(shiftPayload.startTimeUtc);
      const endTime = new Date(shiftPayload.endTimeUtc);
      if (endTime <= startTime) {
        throw new BadRequestException('End time must be after start time');
      }
    }

    const updatedShift = { ...shift, ...shiftPayload };
    const savedShift = await BaseRepository.save(ShiftEntity, updatedShift);
    return ShiftResponse.toResponse(savedShift);
  }

  static async delete(id: string): Promise<void> {
    const shift = await BaseRepository.getByPrimaryKey(
      ShiftEntity, 
      'shiftId', 
      id, 
      [], 
      true
    );
    
    if (!shift) throw new NotFoundException('Shift not found');
    await BaseRepository.delete(ShiftEntity, id, 'shiftId');
  }

  static async archive(id: string): Promise<Shift> {
    const shift = await BaseRepository.getByPrimaryKey(
      ShiftEntity, 
      'shiftId', 
      id, 
      [], 
      true
    );
    
    if (!shift) throw new NotFoundException('Shift not found');
    const result = await BaseRepository.archive(ShiftEntity, id, 'shiftId');
    if (result) shift.archivedAt = new Date();
    return ShiftResponse.toResponse(shift);
  }

  static async restore(id: string): Promise<Shift> {
    const shift = await BaseRepository.getByPrimaryKey(
      ShiftEntity, 
      'shiftId', 
      id, 
      [], 
      true
    );
    
    if (!shift) throw new NotFoundException('Shift not found');
    const result = await BaseRepository.restore(ShiftEntity, id, 'shiftId');
    if (result) shift.archivedAt = undefined;
    return ShiftResponse.toResponse(shift);
  }

  static async publish(id: string): Promise<Shift> {
    const shift = await BaseRepository.getByPrimaryKey(
      ShiftEntity, 
      'shiftId', 
      id, 
      ['assignments'], 
      true
    );
    
    if (!shift) throw new NotFoundException('Shift not found');
    
    // Check if shift has at least one assigned staff
    if (!shift.assignments || shift.assignments.length === 0) {
      throw new BadRequestException('Cannot publish shift without assigned staff');
    }
    
    shift.status = 'published';
    shift.publishedAt = new Date();
    
    const savedShift = await BaseRepository.save(ShiftEntity, shift);
    return ShiftResponse.toResponse(savedShift);
  }

  static async assignStaff(shiftId: string, userIds: string[], assignedBy: string): Promise<any> {
    // Fetch the shift with its relations
    const shift = await BaseRepository.getByPrimaryKey(
      ShiftEntity,
      'shiftId',
      shiftId,
      ['location', 'skill', 'assignments'],
      true
    );

    if (!shift) throw new NotFoundException('Shift not found');

    // Get existing assignments count
    const existingAssignmentsCount = shift.assignments?.length || 0;
    const remainingHeadcount = shift.requiredHeadcount - existingAssignmentsCount;

    // Check if trying to assign more staff than needed
    if (userIds.length > remainingHeadcount) {
      throw new BadRequestException(
        `Cannot assign ${userIds.length} staff. Only ${remainingHeadcount} position(s) remaining (${shift.requiredHeadcount} required, ${existingAssignmentsCount} already assigned).`
      );
    }

    const shiftStart = new Date(shift.startTimeUtc);
    const shiftEnd = new Date(shift.endTimeUtc);
    
    // Get location timezone offset (simplified - using standard offset)
    // For America/New_York: UTC-5 (standard) or UTC-4 (daylight)
    // We'll calculate the local time by checking the shift date
    const getTimezoneOffset = (timezone: string, date: Date): number => {
      // This is a simplified approach - in production, use a proper timezone library
      const timezoneOffsets: { [key: string]: number } = {
        'America/New_York': -5, // EST (will be -4 during DST)
        'America/Chicago': -6,
        'America/Denver': -7,
        'America/Los_Angeles': -8,
        'America/Phoenix': -7,
        'UTC': 0
      };
      
      // Check if DST is in effect (rough approximation for US)
      const month = date.getUTCMonth();
      const isDST = month >= 2 && month <= 10; // March to November (rough)
      
      const baseOffset = timezoneOffsets[timezone] || 0;
      return isDST && timezone.startsWith('America/') && timezone !== 'America/Phoenix' 
        ? baseOffset + 1 
        : baseOffset;
    };
    
    const shiftDayOfWeek = shiftStart.getUTCDay(); // 0 = Sunday, 1 = Monday, etc.

    const results: any[] = [];
    const errors: string[] = [];

    // Process each user
    for (const userId of userIds) {
      try {
        // Check if user is already assigned to this shift
        const existingAssignment = shift.assignments?.find(a => a.userId === userId);
        if (existingAssignment) {
          errors.push(`Staff member is already assigned to this shift`);
          continue;
        }

        // Fetch all availability records for this user at this location
        const connection = await DBContext.getConnection();
        const availabilityRepo = connection.getRepository(StaffAvailabilityEntity);
        const availabilities = await availabilityRepo.find({
          where: {
            userId: userId,
            locationId: shift.locationId
          },
          relations: ['location']
        });

        if (!availabilities || availabilities.length === 0) {
          errors.push(`Staff has no availability set for this location`);
          continue;
        }

        // Get location for timezone
        const location = shift.location || await BaseRepository.getByPrimaryKey(
          LocationEntity,
          'locationId',
          shift.locationId,
          [],
          true
        );

        if (!location) {
          errors.push(`Location not found`);
          continue;
        }

        // Check for exceptions first (they override recurring availability)
        const exceptionDate = shiftStart.toISOString().split('T')[0]; // YYYY-MM-DD
        const exception = availabilities.find(
          (a: any) => a.type === 'exception' && a.exceptionDate === exceptionDate
        );

        let isAvailable = false;

        if (exception) {
          // If there's an exception for this date
          if (!exception.isAvailable) {
            errors.push(`Staff is not available on ${exceptionDate} (exception: ${exception.notes || 'unavailable'})`);
            continue;
          }

          // Check if shift falls within exception time window
          if (!exception.exceptionStartTimeUtc || !exception.exceptionEndTimeUtc) {
            errors.push(`Exception has invalid time data`);
            continue;
          }
          const exceptionStart = new Date(exception.exceptionStartTimeUtc);
          const exceptionEnd = new Date(exception.exceptionEndTimeUtc);

          if (shiftStart >= exceptionStart && shiftEnd <= exceptionEnd) {
            isAvailable = true;
          } else {
            errors.push(`Shift time (${shiftStart.toISOString()} - ${shiftEnd.toISOString()}) falls outside staff's exception availability window`);
            continue;
          }
        } else {
          // Check recurring availability for this day of week
          const recurringAvailability = availabilities.find(
            (a: any) => a.type === 'recurring' && a.dayOfWeek === shiftDayOfWeek && a.isAvailable
          );

          if (!recurringAvailability) {
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            errors.push(`Staff has no recurring availability for ${dayNames[shiftDayOfWeek]}`);
            continue;
          }

          // Parse recurring time (format: "09:00 AM") and convert to minutes since midnight
          const parseTimeToMinutes = (timeStr: string): number => {
            const [time, period] = timeStr.split(' ');
            let [hours, minutes] = time.split(':').map(Number);
            
            if (period === 'PM' && hours !== 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;

            return hours * 60 + minutes;
          };

          // Get availability time in minutes (these are in local timezone)
          const availStartMinutes = parseTimeToMinutes(recurringAvailability.startTime!);
          const availEndMinutes = parseTimeToMinutes(recurringAvailability.endTime!);

          // Convert shift UTC times to local timezone for comparison
          const tzOffset = getTimezoneOffset(location.timeZone || 'UTC', shiftStart);
          
          // Create local time by adding offset
          const shiftStartLocal = new Date(shiftStart.getTime() + tzOffset * 60 * 60 * 1000);
          const shiftEndLocal = new Date(shiftEnd.getTime() + tzOffset * 60 * 60 * 1000);
          
          const shiftStartMinutes = shiftStartLocal.getUTCHours() * 60 + shiftStartLocal.getUTCMinutes();
          const shiftEndMinutes = shiftEndLocal.getUTCHours() * 60 + shiftEndLocal.getUTCMinutes();

          // Check if shift falls within availability window
          if (shiftStartMinutes >= availStartMinutes && shiftEndMinutes <= availEndMinutes) {
            isAvailable = true;
          } else {
            const formatMinutes = (mins: number) => {
              const h = Math.floor(mins / 60);
              const m = mins % 60;
              return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
            };
            errors.push(`Shift time (${formatMinutes(shiftStartMinutes)} - ${formatMinutes(shiftEndMinutes)}) falls outside staff's availability window (${recurringAvailability.startTime} - ${recurringAvailability.endTime})`);
            continue;
          }
        }

        if (!isAvailable) {
          errors.push(`Staff is not available during shift time`);
          continue;
        }

        // Check for overlapping shift assignments
        const assignmentRepo = connection.getRepository(ShiftAssignmentEntity);
        const existingAssignments = await assignmentRepo.find({
          where: [
            { userId: userId, status: 'assigned' },
            { userId: userId, status: 'confirmed' }
          ],
          relations: ['shift']
        });

        let hasOverlap = false;
        for (const assignment of existingAssignments) {
          if (assignment.shift) {
            const existingStart = new Date(assignment.shift.startTimeUtc);
            const existingEnd = new Date(assignment.shift.endTimeUtc);

            // Check for overlap
            if (
              (shiftStart >= existingStart && shiftStart < existingEnd) ||
              (shiftEnd > existingStart && shiftEnd <= existingEnd) ||
              (shiftStart <= existingStart && shiftEnd >= existingEnd)
            ) {
              hasOverlap = true;
              errors.push(`Staff is already assigned to another shift from ${existingStart.toISOString()} to ${existingEnd.toISOString()}`);
              break;
            }

            // Check minimum rest period (10 hours)
            const timeBetween = Math.abs(shiftStart.getTime() - existingEnd.getTime()) / (1000 * 60 * 60);
            const timeBetweenReverse = Math.abs(existingStart.getTime() - shiftEnd.getTime()) / (1000 * 60 * 60);

            if (timeBetween < 10 || timeBetweenReverse < 10) {
              hasOverlap = true;
              errors.push(`Staff needs at least 10 hours rest between shifts. Current gap is ${Math.min(timeBetween, timeBetweenReverse).toFixed(1)} hours`);
              break;
            }
          }
        }

        if (hasOverlap) {
          continue;
        }

        // All checks passed - create assignment
        const assignment = await BaseRepository.save(ShiftAssignmentEntity, {
          shiftId: shiftId,
          userId: userId,
          status: 'assigned',
          assignedAt: new Date(),
          assignedBy: assignedBy,
          createdBy: assignedBy,
          createdAt: new Date(),
        });

        results.push(ShiftAssignmentResponse.toResponse(assignment));
      } catch (error: any) {
        errors.push(`Error assigning staff: ${error.message}`);
      }
    }

    // Return results
    if (results.length === 0 && errors.length > 0) {
      throw new BadRequestException(`Failed to assign staff: ${errors.join('; ')}`);
    }

    return {
      success: results.length,
      failed: errors.length,
      assignments: results,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
}
