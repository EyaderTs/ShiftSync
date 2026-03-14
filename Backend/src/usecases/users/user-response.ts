// import { LocationResponse } from "../locations/location.response";
// import { UserLocationResponse } from "./user-location.response";
import { User } from "../../domains/users/user-model";
import { LocationResponse } from "../locations/location-response";
import { SkillResponse } from "../skills/skill-response";
import { UserLocationResponse } from "./user-location-response";

export class UserResponse {
  static toResponse(user: User) {
    const response: any = {
      userId: user.userId,
      firstName: user.firstName,
      middleName:user.middleName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role ? user.role : undefined,
      locationId:user.location?.locationId,
      schoolId:user.schoolId,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt,
      isActive: user.isActive,
      updatedAt: user.updatedAt,
      createdBy: user.createdBy,
      updatedBy: user.updatedBy,
    };
    if (user.location) {
      response.location = LocationResponse.toResponse(user.location);
    }
    if (user.userLocations) {
      response.userLocations = Array.isArray(user.userLocations) ? user.userLocations.map((userLocation) => {
        return UserLocationResponse.toResponse(userLocation);
      }) : [];
    }
    if (user.skill) {
      response.skill = SkillResponse.toResponse(user.skill);
    }
    return response;
  }
}