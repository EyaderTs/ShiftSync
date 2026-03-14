import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
  DeleteDateColumn
} from "typeorm";

@Entity("skills")
export class SkillEntity {
  @PrimaryColumn('uuid', {
    generated: 'uuid',
    name: 'skill_id'
  })
  skillId!: string;

  @Column({ type: "varchar", name: "name", nullable: false })
  name?: string;
  
  @Column({ type: "varchar", name: "description", nullable: true })
  description?: string;

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
} 