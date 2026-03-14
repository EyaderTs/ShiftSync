import {  UserLocation } from "../../domains/location/user-location-model";
 import { LocationResponse } from "../locations/location-response";

export class UserLocationResponse {
  static toResponse(userLocation: UserLocation) {
    const response: any = {
      userLocationId: userLocation.userLocationId,
      userId: userLocation.userId,
      locationId: userLocation.locationId,
      createdBy: userLocation.createdBy,
      updatedBy: userLocation.updatedBy,
      archivedBy: userLocation.archivedBy,
      createdAt: userLocation.createdAt,
      updatedAt: userLocation.updatedAt,
      archivedAt: userLocation.archivedAt,
    };

    if (userLocation.location) {
      response.location = LocationResponse.toResponse(userLocation.location);
    }

    return response;
  }
}