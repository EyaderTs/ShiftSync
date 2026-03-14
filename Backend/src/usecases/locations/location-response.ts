import { Location } from "../../domains/location/location-model";

export class LocationResponse {
  static toResponse(location: Location) {
    return {
      locationId: location.locationId,
      name: location.name,
      address: location.address,
      timeZone: location.timeZone,
      createdAt: location.createdAt,
      updatedAt: location.updatedAt,
      updatedBy: location.updatedBy,
      createdBy: location.createdBy,
      
    };
  }
}
