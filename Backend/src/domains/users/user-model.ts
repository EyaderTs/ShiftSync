import { Location } from "../location/location-model";
import { UserLocation } from "../location/user-location-model";
import { Skill } from "../skill/skill-models";


export interface User {
  userId: string;
  firstName?: string;
  middleName?:string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  hashedPassword?: string;
  isActive?: boolean;
  location?:Location,
  schoolId?:string,
  role?:string,
  skill?:Skill,
  userLocations?:UserLocation[] | undefined,
  confirmationCode?:string,
  profilePicture?: string;  // URL to the user's profile picture stored in MinIO
  createdBy?:string,
  updatedBy?:string,
  createdAt?: Date;
  updatedAt?: Date;
  archivedAt?:Date ;
}
