import { User } from "../users/user-model";
import { Shift } from "./shift-model";

export interface ShiftAssignment {
  assignmentId: string;
  shiftId: string;
  userId: string;
  status: 'assigned' | 'confirmed' | 'cancelled';
  assignedAt?: Date;
  assignedBy?: string;
  shift?: Shift;
  user?: User;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
  archivedAt?: Date;
}
