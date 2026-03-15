import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { LocationEntity } from "../locations/location-schema";
import { SkillEntity } from "../skills/skill-schema";
import { ShiftAssignmentEntity } from "./shift-assignment-schema";

@Entity("shifts")
export class ShiftEntity {
  @PrimaryColumn("uuid", {
    generated: "uuid",
    name: "shift_id",
  })
  shiftId!: string;

  @Column({ type: "uuid", name: "location_id", nullable: false })
  locationId!: string;

  @Column({ type: "uuid", name: "skill_id", nullable: false })
  skillId!: string;

  @Column({ type: "int", name: "required_headcount", nullable: false })
  requiredHeadcount!: number;

  @Column({ type: "timestamp", name: "start_time_utc", nullable: false })
  startTimeUtc!: Date;

  @Column({ type: "timestamp", name: "end_time_utc", nullable: false })
  endTimeUtc!: Date;

  @Column({ type: "varchar", name: "status", nullable: false, default: 'draft' })
  status!: 'draft' | 'published' | 'completed' | 'cancelled';

  @Column({ type: "boolean", name: "is_premium", nullable: true, default: false })
  isPremium?: boolean;

  @Column({ type: "timestamp", name: "published_at", nullable: true })
  publishedAt?: Date;

  @Column({ type: "timestamp", name: "cutoff_time_utc", nullable: true })
  cutoffTimeUtc?: Date;

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

  @ManyToOne(() => LocationEntity, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "location_id" })
  location?: LocationEntity;

  @ManyToOne(() => SkillEntity, { onDelete: "CASCADE", onUpdate: "CASCADE" })
  @JoinColumn({ name: "skill_id" })
  skill?: SkillEntity;

  @OneToMany(() => ShiftAssignmentEntity, (assignment) => assignment.shift)
  assignments?: ShiftAssignmentEntity[];
}
