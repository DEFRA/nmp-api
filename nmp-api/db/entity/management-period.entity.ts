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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity({ name: 'ManagementPeriods' })
export default class ManagementPeriodEntity {
  @PrimaryGeneratedColumn('identity', {
    generatedIdentity: 'ALWAYS',
  })
  @PrimaryColumn({ type: 'int', insert: false })
  ID: number;

  @Column('int')
  CropId: number;

  @ManyToOne(() => CropEntity, (crop) => crop.ManagementPeriod)
  @JoinColumn({ name: 'CropID' })
  Crop: CropEntity;

  @Column({ default: 1, nullable: true })
  @ApiPropertyOptional()
  DefoliationID: number;

  @Column({ default: 0, nullable: true })
  @ApiPropertyOptional()
  Utilisation1ID: number;

  @Column({ default: 0, nullable: true })
  @ApiPropertyOptional()
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
  @ApiPropertyOptional()
  PloughedDown: Date;

  @Column('int', { nullable: true })
  @ApiPropertyOptional()
  CreatedByID: number;

  @Column('int', { nullable: true })
  @ApiPropertyOptional()
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
  @ApiPropertyOptional()
  CreatedOn: Date;

  @Column('datetime2', { nullable: true })
  @ApiPropertyOptional()
  ModifiedOn: Date;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  PreviousID: number;
}
