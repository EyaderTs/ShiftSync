export interface Shift {
  shiftId: string;
  locationId: string;
  skillId: string;
  requiredHeadcount: number;
  startTimeUtc: Date | string;
  endTimeUtc: Date | string;
  status: 'draft' | 'published' | 'completed' | 'cancelled';
  isPremium?: boolean;
  publishedAt?: Date | string;
  cutoffTimeUtc?: Date | string;
  location?: any;
  skill?: any;
  assignments?: any[];
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  archivedAt?: Date | string;
}
