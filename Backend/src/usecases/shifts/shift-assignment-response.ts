import { ShiftAssignment } from "../../domains/shift/shift-assignment-model";
import { UserResponse } from "../users/user-response";

export class ShiftAssignmentResponse {
  static toResponse(assignment: ShiftAssignment) {
    const response: any = {
      assignmentId: assignment.assignmentId,
      shiftId: assignment.shiftId,
      userId: assignment.userId,
      status: assignment.status,
      assignedAt: assignment.assignedAt,
      assignedBy: assignment.assignedBy,
      createdAt: assignment.createdAt,
      updatedAt: assignment.updatedAt,
      createdBy: assignment.createdBy,
      updatedBy: assignment.updatedBy,
    };

    if (assignment.user) {
      response.user = UserResponse.toResponse(assignment.user);
    }

    if (assignment.shift) {
      response.shift = {
        shiftId: assignment.shift.shiftId,
        locationId: assignment.shift.locationId,
        skillId: assignment.shift.skillId,
        startTimeUtc: assignment.shift.startTimeUtc,
        endTimeUtc: assignment.shift.endTimeUtc,
        status: assignment.shift.status,
      };
    }

    return response;
  }
}
