import { Skill } from "./skill-model";

export interface User {
    userId?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    password?: string;
    role?:string;
    skillId?:string;
    skill?:Skill;
    isActive?: boolean;
    userLocations?:any,
    profilePicture?:string;
    createdBy?:string,
    updatedBy?:string,
    createdAt?: string;
    updatedAt?: string;
    archivedAt?:string;
  }
  