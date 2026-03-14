import { UserLocation } from "./user-location-model";

export interface Location {
  locationId: string;
  name?: string;
  address?: string;
  timeZone?: string;
  createdAt?: Date;
  updatedAt?: Date;
  updatedBy?: string;
  createdBy?: string;
  archivedAt?: Date;
  // userRoles?: UserRole
}
