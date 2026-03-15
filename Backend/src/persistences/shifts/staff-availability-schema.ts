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
import { UserEntity } from "../users/user-schema";
import { LocationEntity } from "../locations/location-schema";

@Entity("staff_availability")
export class StaffAvailabilityEntity {
  @PrimaryColumn("uuid", {
    generated: "uuid",
    name: "availability_id",
  })
  availabilityId!: string;

  @Column({ type: "uuid", name: "user_id", nullable: false })
  userId!: string;

  @Column({ type: "uuid", name: "location_id", nullable: false })
  locationId!: string;

  @Column({ type: "varchar", name: "type", nullable: false })
  type!: 'recurring' | 'exception';

  @Column({ type: "int", name: "day_of_week", nullable: true })
  dayOfWeek?: number;

  @Column({ type: "varchar", name: "start_time", nullable: true })
  startTime?: string;

  @Column({ type: "varchar", name: "end_time", nullable: true })
  endTime?: string;

  @Column({ type: "varchar", name: "exception_date", nullable: true })
  exceptionDate?: string;

  @Column({ type: "timestamp", name: "exception_start_time_utc", nullable: true })
  exceptionStartTimeUtc?: Date;

  @Column({ type: "timestamp", name: "exception_end_time_utc", nullable: true })
  exceptionEndTimeUtc?: Date;

  @Column({ type: "boolean", name: "is_available", nullable: false, default: true })
  isAvailable!: boolean;

  @Column({ type: "text", name: "notes", nullable: true })
  notes?: string;

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

  @ManyToOne(() => UserEntity, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user?: UserEntity;

  @ManyToOne(() => LocationEntity, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "location_id" })
  location?: LocationEntity;
}
