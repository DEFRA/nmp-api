import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import FieldEntity from './field.entity';
import UserEntity from './user.entity';

@Entity({ name: 'SnsAnalyses' })
export default class SnsAnalysesEntity {
  @PrimaryGeneratedColumn('identity', {
    generatedIdentity: 'ALWAYS',
    primaryKeyConstraintName: 'PK_SnsAnalyses',
  })
  @PrimaryColumn({ type: 'int', insert: false })
  Id: number;

  @ManyToOne(() => FieldEntity, (field) => field.SnsAnalyses)
  @JoinColumn({ name: 'FieldID' })
  Field: FieldEntity;

  @Column('int')
  FieldID: number;

  @Column('datetime2', { precision: 7, nullable: true })
  @ApiPropertyOptional()
  SampleDate: Date;

  @Column('int', { nullable: true })
  @ApiPropertyOptional()
  SnsAt0to30cm: number;

  @Column('int', { nullable: true })
  @ApiPropertyOptional()
  SnsAt30to60cm: number;

  @Column('int', { nullable: true })
  @ApiPropertyOptional()
  SnsAt60to90cm: number;

  @Column('int', { nullable: true })
  @ApiPropertyOptional()
  SampleDepth: number;

  @Column('int', { nullable: true })
  @ApiPropertyOptional()
  SoilMineralNitrogen: number;

  @Column('int', { nullable: true })
  @ApiPropertyOptional()
  NumberOfShoots: number;

  @Column('decimal', { precision: 18, scale: 3, nullable: true })
  @ApiPropertyOptional()
  CropHeight: number;

  @Column('int', { nullable: true })
  @ApiPropertyOptional()
  SeasonId: number;

  @Column('decimal', { precision: 18, scale: 3, nullable: true })
  @ApiPropertyOptional()
  PercentageOfOrganicMatter: number;

  @Column('decimal', { precision: 18, scale: 3, nullable: true })
  @ApiPropertyOptional()
  AdjustmentValue: number;

  @Column('int', { nullable: true })
  @ApiPropertyOptional()
  SoilNitrogenSupplyValue: number;

  @Column('tinyint', { nullable: true })
  @ApiPropertyOptional()
  SoilNitrogenSupplyIndex: number;

  @Column('datetime2', {
    precision: 7,
    default: () => 'GETDATE()',
    nullable: true,
  })
  @ApiPropertyOptional()
  CreatedOn: Date;

  @Column('int', { nullable: true })
  @ApiPropertyOptional()
  CreatedByID: number;

  @ManyToOne(() => UserEntity, (user) => user.CreatedSnsAnalyses)
  @JoinColumn({ name: 'CreatedByID' })
  CreatedByUser: UserEntity;

  @Column('datetime2', { precision: 7, nullable: true })
  @ApiPropertyOptional()
  ModifiedOn: Date;

  @Column('int', { nullable: true })
  @ApiPropertyOptional()
  ModifiedByID: number;

  @ManyToOne(() => UserEntity, (user) => user.ModifiedSnsAnalyses)
  @JoinColumn({ name: 'ModifiedByID' }) // Corrected from 'CreatedByID' to 'ModifiedByID'
  ModifiedByUser: UserEntity;
}
