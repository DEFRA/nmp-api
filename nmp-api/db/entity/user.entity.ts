import {
  Column,
  Entity,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import FieldEntity from './field.entity';
import FarmEntity from './farm.entity';
import CropEntity from './crop.entity';
import SoilAnalysisEntity from './soil-analysis.entity';
import ManagementPeriodEntity from './management-period.entity';
import { RecommendationEntity } from './recommendation.entity';
import { RecommendationCommentEntity } from './recommendation-comment.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrganicManureEntity } from './organic-manure.entity';
import { FertiliserManuresEntity } from './fertiliser-manures.entity';
import SnsAnalysesEntity from './sns-analysis.entity';

@Entity({ name: 'Users' })
export default class UserEntity {
  @PrimaryGeneratedColumn('identity', {
    generatedIdentity: 'ALWAYS',
  })
  @PrimaryColumn({ type: 'int', insert: false })
  ID: number;

  @Column('nvarchar', { length: 50 })
  @ApiProperty()
  GivenName: string;

  @Column('nvarchar', { length: 50 })
  @ApiPropertyOptional()
  Surname?: string;

  @Column('nvarchar', { length: 256 })
  @ApiProperty()
  Email: string;

  @Column('uniqueidentifier', { nullable: true, unique: true })
  @ApiPropertyOptional()
  UserIdentifier: string;

  @OneToMany(() => FieldEntity, (field) => field.CreatedByUser)
  CreatedFields: FieldEntity[];

  @OneToMany(() => FieldEntity, (field) => field.ModifiedByUser)
  ModifiedFields: FieldEntity[];

  @OneToMany(() => FarmEntity, (farm) => farm.CreatedByUser)
  CreatedFarms: FarmEntity[];

  @OneToMany(() => FarmEntity, (farm) => farm.ModifiedByUser)
  ModifiedFarms: FarmEntity[];

  @OneToMany(() => CropEntity, (crop) => crop.CreatedByUser)
  CreatedCrops: CropEntity[];

  @OneToMany(() => CropEntity, (crop) => crop.ModifiedByUser)
  ModifiedCrops: CropEntity[];

  @OneToMany(() => OrganicManureEntity, (crop) => crop.CreatedByUser)
  CreatedOrganicManures: OrganicManureEntity[];

  @OneToMany(() => OrganicManureEntity, (crop) => crop.ModifiedByUser)
  ModifiedOrganicManures: OrganicManureEntity[];

  @OneToMany(
    () => SoilAnalysisEntity,
    (soilAnalysis) => soilAnalysis.CreatedByUser,
  )
  CreatedSoilAnalyses: SoilAnalysisEntity[];

  @OneToMany(
    () => SoilAnalysisEntity,
    (soilAnalysis) => soilAnalysis.ModifiedByUser,
  )
  ModifiedSoilAnalyses: SoilAnalysisEntity[];

  @OneToMany(
    () => SnsAnalysesEntity,
    (snsAnalysis) => snsAnalysis.CreatedByUser,
  )
  CreatedSnsAnalyses: SnsAnalysesEntity[]; // Added relation

  @OneToMany(
    () => SnsAnalysesEntity,
    (snsAnalysis) => snsAnalysis.ModifiedByUser,
  )
  ModifiedSnsAnalyses: SnsAnalysesEntity[];

  @OneToMany(
    () => ManagementPeriodEntity,
    (managementPeriod) => managementPeriod.CreatedByUser,
  )
  CreatedManagementPeriods: ManagementPeriodEntity[];

  @OneToMany(
    () => ManagementPeriodEntity,
    (managementPeriod) => managementPeriod.ModifiedByUser,
  )
  ModifiedManagementPeriods: ManagementPeriodEntity[];

  @OneToMany(
    () => RecommendationEntity,
    (recommendation) => recommendation.CreatedByUser,
  )
  CreatedRecommendations: RecommendationEntity[];

  @OneToMany(
    () => RecommendationEntity,
    (recommendation) => recommendation.ModifiedByUser,
  )
  ModifiedRecommendations: RecommendationEntity[];

  @OneToMany(
    () => RecommendationCommentEntity,
    (recommendationComment) => recommendationComment.CreatedByUser,
  )
  CreatedRecommendationComments: RecommendationCommentEntity[];

  @OneToMany(
    () => RecommendationCommentEntity,
    (recommendationComment) => recommendationComment.ModifiedByUser,
  )
  ModifiedRecommendationComments: RecommendationCommentEntity[];

  @OneToMany(
    () => RecommendationCommentEntity,
    (recommendationComment) => recommendationComment.CreatedByUser,
  )
  CreatedFertiliserManures: FertiliserManuresEntity[];

  @OneToMany(
    () => RecommendationCommentEntity,
    (recommendationComment) => recommendationComment.ModifiedByUser,
  )
  ModifiedFertiliserManures: FertiliserManuresEntity[];
}
