import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { ShiftEntity } from "./shift-schema";
import { UserEntity } from "../users/user-schema";

@Entity("shift_assignments")
export class ShiftAssignmentEntity {
  @PrimaryColumn("uuid", {
    generated: "uuid",
    name: "assignment_id",
  })
  assignmentId!: string;

  @Column({ type: "uuid", name: "shift_id", nullable: false })
  shiftId!: string;

  @Column({ type: "uuid", name: "user_id", nullable: false })
  userId!: string;

  @Column({ type: "varchar", name: "status", nullable: false, default: "assigned" })
  status!: 'assigned' | 'confirmed' | 'cancelled';

  @Column({ type: "timestamp", name: "assigned_at", nullable: true })
  assignedAt?: Date;

  @Column({ type: "varchar", name: "assigned_by", nullable: true })
  assignedBy?: string;

  @Column({ type: "varchar", name: "created_by", nullable: true })
  createdBy?: string;

  @Column({ type: "varchar", name: "updated_by", nullable: true })
  updatedBy?: string;

  @CreateDateColumn({ type: "timestamp", name: "created_at", nullable: true })
  createdAt?: Date;

  @UpdateDateColumn({ type: "timestamp", name: "updated_at", nullable: true })
  updatedAt?: Date;

  @DeleteDateColumn({ type: "timestamp", name: "archived_at", nullable: true })
  archivedAt?: Date;

  @ManyToOne(() => ShiftEntity, shift => shift.assignments, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "shift_id" })
  shift?: ShiftEntity;

  @ManyToOne(() => UserEntity, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user?: UserEntity;
}
