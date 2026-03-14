import { User } from "../users/user-model";
import { Location } from "./location-model";

export interface UserLocation{
    userLocationId?:string,
    userId?:string,
    locationId?:string,
    location?: Location,
    user?:User,
    createdBy?:string,
    updatedBy?:string,
    archivedBy?:string,
    createdAt?:Date,
    updatedAt?:Date,
    archivedAt?:Date,
}