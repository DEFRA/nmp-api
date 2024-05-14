import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  OneToMany,
} from 'typeorm';

import CropEntity from './crop.entity';
import UserEntity from './user.entity';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RecommendationEntity } from './recommendation.entity';

@Entity({ name: 'ManagementPeriods' })
export default class ManagementPeriodEntity {
  @PrimaryGeneratedColumn('identity', {
    generatedIdentity: 'ALWAYS',
  })
  @PrimaryColumn({ type: 'int', insert: false })
  ID: number;

  @Column('int')
  CropID: number;

  @ManyToOne(() => CropEntity, (crop) => crop.ManagementPeriods)
  @JoinColumn({ name: 'CropID' })
  Crops: CropEntity;

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

  @Column('datetime2', { nullable: true, precision: 7, default: 'GETDATE()' })
  @ApiPropertyOptional()
  CreatedOn: Date;

  @Column('datetime2', { nullable: true, precision: 7 })
  @ApiPropertyOptional()
  ModifiedOn: Date;

  @Column({ nullable: true })
  @ApiPropertyOptional()
  PreviousID: number;

  @OneToMany(
    () => RecommendationEntity,
    (recommendation) => recommendation.ManagementPeriods,
  )
  @JoinColumn({ name: 'ManagementPeriodID' })
  Recommendations: RecommendationEntity[];
}
