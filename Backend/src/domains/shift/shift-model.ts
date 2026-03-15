import { Location } from "../location/location-model";
import { Skill } from "../skill/skill-models";
import { ShiftAssignment } from "./shift-assignment-model";

export interface Shift {
  shiftId: string;
  locationId: string;
  skillId: string;
  requiredHeadcount: number;
  startTimeUtc: Date;
  endTimeUtc: Date;
  status: 'draft' | 'published' | 'completed' | 'cancelled';
  isPremium?: boolean;
  publishedAt?: Date;
  cutoffTimeUtc?: Date;
  location?: Location;
  skill?: Skill;
  assignments?: ShiftAssignment[];
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  archivedAt?: Date;
} 