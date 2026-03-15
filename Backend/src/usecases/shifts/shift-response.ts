import { Shift } from "../../domains/shift/shift-model";
import { LocationResponse } from "../locations/location-response";
import { SkillResponse } from "../skills/skill-response";
import { ShiftAssignmentResponse } from "./shift-assignment-response";

export class ShiftResponse {
  static toResponse(shift: any) {
    const response: any = {
      shiftId: shift.shiftId,
      locationId: shift.locationId,
      skillId: shift.skillId,
      requiredHeadcount: shift.requiredHeadcount,
      startTimeUtc: shift.startTimeUtc,
      endTimeUtc: shift.endTimeUtc,
      status: shift.status,
      isPremium: shift.isPremium,
      publishedAt: shift.publishedAt,
      cutoffTimeUtc: shift.cutoffTimeUtc,
      createdAt: shift.createdAt,
      updatedAt: shift.updatedAt,
      createdBy: shift.createdBy,
      updatedBy: shift.updatedBy,
    };

    if (shift.location) {
      response.location = LocationResponse.toResponse(shift.location);
    }

    if (shift.skill) {
      response.skill = SkillResponse.toResponse(shift.skill);
    }

    if (shift.assignments) {
      response.assignments = shift.assignments.map((assignment: any) =>
        ShiftAssignmentResponse.toResponse(assignment)
      );
    }

    return response;
  }
}

export default ShiftResponse;
