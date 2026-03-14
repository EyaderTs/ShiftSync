import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
} from "typeorm";
import { UserEntity } from "./user-schema";
import { LocationEntity } from "../locations/location-schema";

@Entity("user_locations")
export class UserLocationEntity {
  @PrimaryColumn("uuid", {
    generated: "uuid",
    name: "user_location_id",
  })
  userLocationId!: string;
  @Column({ type: "uuid", name: "user_id", nullable: true })  // Changed to uuid
  userId!: string;

  @Column({ type: "uuid", name: "location_id", nullable: true })  // Changed to uuid
  locationId!: string;

  @Column({ type: "varchar", name: "created_by", nullable: true })  // Changed to varchar
  createdBy?: string;

  @Column({ type: "varchar", name: "updated_by", nullable: true })  // Changed to varchar
  updatedBy?: string;

  @Column({ type: "varchar", name: "archived_by", nullable: true })  // Changed to varchar
  archivedBy?: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", nullable: true })
  updatedAt?: Date;

  @DeleteDateColumn({ name: "archived_at", nullable: true })
  archivedAt?: Date;

  @ManyToOne(() => UserEntity, user => user.userLocations, { onDelete: "SET NULL" })  // Added inverse relation, changed CASCADE to SET NULL
  @JoinColumn({ name: "user_id" })
  user!: UserEntity;

  @ManyToOne(() => LocationEntity, location => location.userLocations, { onDelete: "SET NULL" })  // Added inverse relation, changed CASCADE to SET NULL
  @JoinColumn({ name: "location_id" })
  location!: LocationEntity;

}
      