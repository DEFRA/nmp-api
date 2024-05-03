import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  PrimaryColumn,
} from 'typeorm';

import CropEntity from './crop.entity';
import UserEntity from './user.entity';

@Entity({ name: 'ManagementPeriods' })
export default class ManagementPeriodEntity {
  @PrimaryGeneratedColumn('identity', {
    generatedIdentity: 'ALWAYS',
  })
  @PrimaryColumn({ type: 'int', insert: false })
  ID: number;

  @Column('int')
  CropId: number;

  @ManyToOne(() => CropEntity, (crop) => crop.ManagementPeriods)
  @JoinColumn({ name: 'CropID' })
  Crop: CropEntity;

  @Column({ default: 1, nullable: true })
  DefoliationID: number;

  @Column({ default: 0, nullable: true })
  Utilisation1ID: number;

  @Column({ default: 0, nullable: true })
  Utilisation2ID: number;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 3,
    default: 0,
    nullable: true,
  })
  Yield: number;

  @Column({ type: 'datetime', nullable: true })
  PloughedDown: Date;

  @Column('int', { nullable: true })
  CreatedByID: number;

  @Column('int', { nullable: true })
  ModifiedByID: number;

  @ManyToOne(() => UserEntity, (user) => user.CreatedManagementPeriods)
  @JoinColumn({ name: 'CreatedByID' })
  CreatedByUser: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.ModifiedManagementPeriods)
  @JoinColumn({ name: 'ModifiedByID' })
  ModifiedByUser: UserEntity;

  // @ManyToOne(() => CropEntity, (crop) => crop.ID)
  // @JoinColumn({ name: 'CropID' })
  // CropID: CropEntity;

  @Column('datetime2', { nullable: true, default: 'GETDATE()' })
  CreatedOn: Date;

  @Column('datetime2', { nullable: true })
  ModifiedOn: Date;

  @Column({ nullable: true })
  PreviousID: number;
}
