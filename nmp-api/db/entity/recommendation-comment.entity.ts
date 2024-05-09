import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import UserEntity from './user.entity';
import { RecommendationEntity } from './recommendation.entity';

@Entity({ name: 'RecommendationComments' })
export class RecommendationCommentEntity {
  @PrimaryGeneratedColumn('identity', {
    generatedIdentity: 'ALWAYS',
  })
  @PrimaryColumn({ type: 'int', insert: false })
  ID: number;

  @Column('int')
  RecommendationID: number;

  @ManyToOne(
    () => RecommendationEntity,
    (recommendation) => recommendation.RecommendationComments,
  )
  @JoinColumn({ name: 'RecommendationID' })
  Recommendations: RecommendationEntity;

  @Column('int', { default: 0 })
  Nutrient: number;

  @Column('nvarchar', { nullable: true })
  Comment: string;

  @Column('datetime2', { nullable: true, precision: 7, default: 'GETDATE()' })
  CreatedOn: Date;

  @Column('datetime2', { nullable: true, precision: 7 })
  ModifiedOn: Date;

  @Column('int', { nullable: true })
  CreatedByID: number;

  @Column('int', { nullable: true })
  ModifiedByID: number;

  @ManyToOne(() => UserEntity, (user) => user.CreatedRecommendationComments)
  @JoinColumn({ name: 'CreatedByID' })
  CreatedByUser: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.ModifiedRecommendationComments)
  @JoinColumn({ name: 'ModifiedByID' })
  ModifiedByUser: UserEntity;

  @Column('int', { nullable: true })
  PreviousID: number;
}
