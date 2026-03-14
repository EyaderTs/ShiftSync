import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
  DeleteDateColumn,
  OneToMany,
} from "typeorm";
import { UserLocationEntity } from "../users/user-location-schema";

@Entity("locations")
export class LocationEntity {
  @PrimaryColumn("uuid", {
    generated: "uuid",
    name: "location_id",
  })
  locationId!: string;

  @Column({ type: "varchar", name: "name", nullable: true })
  name?: string;

  @Column({ type: "varchar", name: "key", nullable: true })
  address?: string;

  @Column({ type: "varchar", name: "time_zone", nullable: true })
  timeZone?: string;

  @Column({ type: "varchar", name: "created_by", nullable: true })
  createdBy?: string;

  @Column({ type: "varchar", name: "updated_by", nullable: true })
  updatedBy?: string;

  @CreateDateColumn({
    type: "timestamp",
    name: "created_at",
    nullable: true,
  })
  createdAt?: Date;

  @UpdateDateColumn({ type: "timestamp", name: "updated_at", nullable: true })
  updatedAt?: Date;

  @DeleteDateColumn({ type: "timestamp", name: "archived_at", nullable: true })
  archivedAt?: Date;

  @OneToMany(() => UserLocationEntity, userLocation => userLocation.location)
  userLocations?: UserLocationEntity[];
}
