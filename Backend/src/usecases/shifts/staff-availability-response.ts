import { StaffAvailability } from "../../domains/shift/staff-availability-model";
import { LocationResponse } from "../locations/location-response";
import { UserResponse } from "../users/user-response";

export class StaffAvailabilityResponse {
  static toResponse(availability: StaffAvailability) {
    const response: any = {
      availabilityId: availability.availabilityId,
      userId: availability.userId,
      locationId: availability.locationId,
      type: availability.type,
      dayOfWeek: availability.dayOfWeek,
      startTime: availability.startTime,
      endTime: availability.endTime,
      exceptionDate: availability.exceptionDate,
      exceptionStartTimeUtc: availability.exceptionStartTimeUtc,
      exceptionEndTimeUtc: availability.exceptionEndTimeUtc,
      isAvailable: availability.isAvailable,
      notes: availability.notes,
      createdAt: availability.createdAt,
      updatedAt: availability.updatedAt,
      createdBy: availability.createdBy,
      updatedBy: availability.updatedBy,
    };

    if (availability.user) {
      response.user = UserResponse.toResponse(availability.user);
    }

    if (availability.location) {
      response.location = LocationResponse.toResponse(availability.location);
    }

    return response;
  }
}
