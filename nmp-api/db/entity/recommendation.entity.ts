import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

import UserEntity from './user.entity';
import ManagementPeriodEntity from './management-period.entity';
import { RecommendationCommentEntity } from './recommendation-comment.entity';

@Entity({ name: 'Recommendations' })
export class RecommendationEntity {
  @PrimaryGeneratedColumn('identity', {
    generatedIdentity: 'ALWAYS',
  })
  @PrimaryColumn({ type: 'int', insert: false })
  ID: number;

  @Column('int')
  ManagementPeriodID: number;

  @ManyToOne(
    () => ManagementPeriodEntity,
    (managementPeriod) => managementPeriod.Recommendations,
  )
  @JoinColumn({ name: 'ManagementPeriodID' })
  ManagementPeriods: ManagementPeriodEntity;

  @Column('decimal', { precision: 18, scale: 3, nullable: true })
  CropN: number;

  @Column('decimal', { precision: 18, scale: 3, nullable: true })
  CropP2O5: number;

  @Column('decimal', { precision: 18, scale: 3, nullable: true })
  CropK2O: number;

  @Column('decimal', { precision: 18, scale: 3, nullable: true })
  CropMgO: number;

  @Column('decimal', { precision: 18, scale: 3, nullable: true })
  CropSO3: number;

  @Column('decimal', { precision: 18, scale: 3, nullable: true })
  CropNa2O: number;

  @Column('decimal', { precision: 18, scale: 3, nullable: true })
  CropLime: number;

  @Column('decimal', { precision: 18, scale: 3, nullable: true })
  ManureN: number;

  @Column('decimal', { precision: 18, scale: 3, nullable: true })
  ManureP2O5: number;

  @Column('decimal', { precision: 18, scale: 3, nullable: true })
  ManureK2O: number;

  @Column('decimal', { precision: 18, scale: 3, nullable: true })
  ManureMgO: number;

  @Column('decimal', { precision: 18, scale: 3, nullable: true })
  ManureSO3: number;

  @Column('decimal', { precision: 18, scale: 3, nullable: true })
  ManureNa2O: number;

  @Column('decimal', { precision: 18, scale: 3, nullable: true })
  ManureLime: number;

  @Column('decimal', { precision: 18, scale: 3, nullable: true })
  FertilizerN: number;

  @Column('decimal', { precision: 18, scale: 3, nullable: true })
  FertilizerP2O5: number;

  @Column('decimal', { precision: 18, scale: 3, nullable: true })
  FertilizerK2O: number;

  @Column('decimal', { precision: 18, scale: 3, nullable: true })
  FertilizerMgO: number;

  @Column('decimal', { precision: 18, scale: 3, nullable: true })
  FertilizerSO3: number;

  @Column('decimal', { precision: 18, scale: 3, nullable: true })
  FertilizerNa2O: number;

  @Column('decimal', { precision: 18, scale: 3, nullable: true })
  FertilizerLime: number;

  @Column('nvarchar', { nullable: true, length: 30 })
  PH: string;

  @Column('nvarchar', { nullable: true, length: 30 })
  SNSIndex: string;

  @Column('nvarchar', { nullable: true, length: 30 })
  PIndex: string;

  @Column('nvarchar', { nullable: true, length: 30 })
  KIndex: string;

  @Column('nvarchar', { nullable: true, length: 30 })
  MgIndex: string;

  @Column('nvarchar', { nullable: true, length: 30 })
  SIndex: string;

  @Column('nvarchar', { nullable: true, length: 30 })
  NaIndex: string;

  @Column('nvarchar', { nullable: true })
  Comments: string;

  @Column('int', { nullable: true })
  CreatedByID: number;

  @Column('int', { nullable: true })
  ModifiedByID: number;

  @ManyToOne(() => UserEntity, (user) => user.CreatedRecommendations)
  @JoinColumn({ name: 'CreatedByID' })
  CreatedByUser: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.ModifiedRecommendations)
  @JoinColumn({ name: 'ModifiedByID' })
  ModifiedByUser: UserEntity;

  @Column('datetime2', { nullable: true, precision: 7, default: 'GETDATE()' })
  CreatedOn: Date;

  @Column('datetime2', { nullable: true, precision: 7 })
  ModifiedOn: Date;

  @Column({ nullable: true })
  PreviousID: number;

  @OneToMany(
    () => RecommendationCommentEntity,
    (recommendationComment) => recommendationComment.Recommendations,
  )
  @JoinColumn({ name: 'RecommendationID' })
  RecommendationComments: RecommendationCommentEntity[];
}
