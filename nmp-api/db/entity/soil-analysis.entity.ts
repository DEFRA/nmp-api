import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import FieldEntity from './field.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import UserEntity from './user.entity';

@Entity({ name: 'SoilAnalyses' })
export default class SoilAnalysisEntity {
  @PrimaryGeneratedColumn('identity', {
    generatedIdentity: 'ALWAYS',
    primaryKeyConstraintName: 'PK_SoilAnalyses',
  })
  @PrimaryColumn({ type: 'int', insert: false })
  ID: number;

  @ManyToOne(() => FieldEntity, (field) => field.SoilAnalyses)
  @JoinColumn({ name: 'FieldID' })
  Field: FieldEntity;

  @Column('int')
  FieldID: number;

  @Column('int')
  @ApiProperty()
  Year: number;

  @Column('bit', { default: 1 })
  @ApiProperty()
  SulphurDeficient: boolean;

  @Column('datetime2', { nullable: true, precision: 7 })
  @ApiPropertyOptional()
  Date: Date;

  @Column('decimal', { precision: 18, scale: 3, nullable: true })
  @ApiPropertyOptional()
  PH: number;

  @Column('int', { nullable: true })
  @ApiPropertyOptional()
  PhosphorusMethodologyID: number;

  @Column('int', { nullable: true })
  @ApiPropertyOptional()
  Phosphorus: number;

  @Column('tinyint', { nullable: true })
  @ApiPropertyOptional()
  PhosphorusIndex: number;

  @Column('int', { nullable: true })
  @ApiPropertyOptional()
  Potassium: number;

  @Column('tinyint', { nullable: true })
  @ApiPropertyOptional()
  PotassiumIndex: number;

  @Column('int', { nullable: true })
  @ApiPropertyOptional()
  Magnesium: number;

  @Column('tinyint', { nullable: true })
  @ApiPropertyOptional()
  MagnesiumIndex: number;

  @Column('int', { nullable: true })
  @ApiPropertyOptional()
  SoilNitrogenSupply: number;

  @Column('tinyint', { nullable: true })
  @ApiPropertyOptional()
  SoilNitrogenSupplyIndex: number;

  @Column('datetime2', { nullable: true, precision: 7 })
  @ApiPropertyOptional()
  SoilNitrogenSampleDate: Date;

  @Column('int', { nullable: true })
  @ApiPropertyOptional()
  Sodium: number;

  @Column('decimal', { precision: 18, scale: 3, nullable: true })
  @ApiPropertyOptional()
  Lime: number;

  @Column('nvarchar', { length: 20, nullable: true })
  @ApiPropertyOptional()
  PhosphorusStatus: string;

  @Column('nvarchar', { length: 50, nullable: true })
  @ApiPropertyOptional()
  PotassiumAnalysis: string;

  @Column('nvarchar', { length: 20, nullable: true })
  @ApiPropertyOptional()
  PotassiumStatus: string;

  @Column('nvarchar', { length: 20, nullable: true })
  @ApiPropertyOptional()
  MagnesiumAnalysis: string;

  @Column('nvarchar', { length: 20, nullable: true })
  @ApiPropertyOptional()
  MagnesiumStatus: string;

  @Column('nvarchar', { length: 20, nullable: true })
  @ApiPropertyOptional()
  NitrogenResidueGroup: string;

  @Column('nvarchar', { length: 255, nullable: true })
  @ApiPropertyOptional()
  Comments: string;

  @Column('int', { nullable: true })
  @ApiPropertyOptional()
  PreviousID: number;

  @Column('datetime2', { nullable: true, precision: 7, default: 'GETDATE()' })
  CreatedOn: Date;

  @Column('int', { nullable: true })
  CreatedByID: number;

  @ManyToOne(() => UserEntity, (user) => user.CreatedSoilAnalyses)
  @JoinColumn({ name: 'CreatedByID' })
  CreatedByUser: UserEntity;

  @Column('datetime2', { nullable: true, precision: 7 })
  ModifiedOn: Date;

  @Column('int', { nullable: true })
  ModifiedByID: number;

  @ManyToOne(() => UserEntity, (user) => user.ModifiedSoilAnalyses)
  @JoinColumn({ name: 'CreatedByID' })
  ModifiedByUser: UserEntity;
}
