import { UUID } from "crypto";
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from "typeorm";
import { LocationEntity } from "../locations/location-schema";
import { UserLocationEntity } from "./user-location-schema";
import { SkillEntity } from "../skills/skill-schema";

@Entity("users")
export class UserEntity {
  @PrimaryColumn('uuid', {
    generated: 'uuid',
    name: 'user_id'
  })
  userId!: string;

  @Column({ type: "varchar", name: "first_name", nullable: true })
  firstName?: string;

  @Column({ type: "varchar", name: "last_name", nullable: true })
  lastName?: string;

  @Column({ type: "varchar", name: "email", nullable: true })
  email?: string;

  @Column({ type: "varchar", name: "phone", nullable: true })
  phone?: string;

  @Column({ type: "varchar", name: "password", nullable: true })
  password?: string;

  @Column({ type: "varchar", name: "role", nullable: true })
  role?: string;

  @Column({ type: "varchar", name: "confirmation_code", nullable: true })
  confirmationCode?: string;

  @Column({ type: "varchar", name: "profile_picture", nullable: true })
  profilePicture?: string;

  @Column({ type: "boolean", name: "is_active", default: true })
  isActive?: boolean;

  @Column({ type: "string", name: "skill_id", nullable: true })
  skillId?: string;

  @Column({ type: "varchar", name: "created_by", nullable: true })
  createdBy?: string;

  @Column({ type: "varchar", name: "updated_by", nullable: true })
  updatedBy?: string;

  @CreateDateColumn({ type: "timestamp", name: "creation_date", nullable: true })
  createdAt?: Date;

  @UpdateDateColumn({ type: "timestamp", name: "updated_at", nullable: true })
  updatedAt?: Date;

  @DeleteDateColumn({ type: "timestamp", name: "archived_at", nullable: true })
  archivedAt?: Date;
  
  @ManyToOne(() => LocationEntity, { onDelete: "SET NULL", onUpdate: "CASCADE" })
  @JoinColumn({ name: "location_id" })
  location?: LocationEntity;

  @OneToMany(() => UserLocationEntity, userLocation => userLocation.user,{
    cascade: true
  })
  userLocations?: UserLocationEntity[];
  
  @ManyToOne(() => SkillEntity, { onDelete: "SET NULL", onUpdate: "CASCADE" })
  @JoinColumn({ name: "skill_id" })
  skill?: SkillEntity;

}
