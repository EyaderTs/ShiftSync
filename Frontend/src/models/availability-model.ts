export interface StaffAvailability {
  availabilityId: string;
  userId: string;
  locationId: string;
  type: 'recurring' | 'exception';
  dayOfWeek?: number; // 0=Sunday, 1=Monday, ..., 6=Saturday (for recurring only)
  startTime?: string; // 12-hour format with AM/PM (e.g., "09:00 AM") in location's timezone (for recurring only)
  endTime?: string; // 12-hour format with AM/PM (e.g., "05:00 PM") in location's timezone (for recurring only)
  exceptionDate?: string; // date string in YYYY-MM-DD format (e.g., "2026-03-15") for exception only
  exceptionStartTimeUtc?: Date; // full datetime in UTC (for exception only)
  exceptionEndTimeUtc?: Date; // full datetime in UTC (for exception only)
  isAvailable: boolean; // true = available, false = unavailable (for exceptions)
  notes?: string; // reason for exception
  user?: any;
  location?: any;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
  archivedAt?: Date;
}
