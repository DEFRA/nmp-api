import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import FarmEntity from './farm.entity';
import UserEntity from './user.entity';
import CropEntity from './crop.entity';
import SoilAnalysisEntity from './soil-analysis.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubSoilEntity } from './sub-soil.entity';
import { TopSoilEntity } from './top-soil.entity';
import SnsAnalysesEntity from './sns-analysis.entity';

@Entity({ name: 'Fields' })
@Index('UC_Fields_FarmName', ['Name', 'FarmID'], { unique: true })
export default class FieldEntity {
  @PrimaryGeneratedColumn('identity', {
    generatedIdentity: 'ALWAYS',
    primaryKeyConstraintName: 'PK_Fields',
  })
  @PrimaryColumn({ type: 'int', insert: false })
  @ApiPropertyOptional()
  ID: number;

  @ManyToOne(() => FarmEntity, (farm) => farm.Fields)
  @JoinColumn({ name: 'FarmID' })
  Farm: FarmEntity;

  @Column('int')
  FarmID: number;

  @Column('int', { nullable: true })
  @ApiPropertyOptional()
  SoilTypeID: number;

  @Column('int', { nullable: true })
  TopSoilID: number;

  @Column('int', { nullable: true })
  SubSoilID: number;

  @Column('int', { default: 1, nullable: true })
  @ApiPropertyOptional()
  NVZProgrammeID: number;

  @Column('nvarchar', { length: 50 })
  @ApiProperty()
  Name: string;

  @Column('nvarchar', { length: 50, nullable: true })
  @ApiPropertyOptional()
  LPIDNumber: string;

  @Column('nvarchar', { length: 50, nullable: true })
  @ApiPropertyOptional()
  NationalGridReference: string;

  @Column('nvarchar', { length: 50, nullable: true })
  @ApiPropertyOptional()
  OtherReference: string;

  @Column('decimal', { precision: 18, scale: 3 })
  @ApiProperty()
  TotalArea: number;

  @Column('decimal', { precision: 18, scale: 3, nullable: true })
  @ApiPropertyOptional()
  CroppedArea: number;

  @Column('decimal', { precision: 18, scale: 3, nullable: true })
  @ApiPropertyOptional()
  ManureNonSpreadingArea: number;

  @Column('bit', { nullable: true, default: 0 })
  @ApiPropertyOptional()
  SoilReleasingClay: boolean;

  @Column('bit', { nullable: true, default: 0 })
  @ApiPropertyOptional()
  SoilOverChalk: boolean;

  @Column('bit', { nullable: true, default: 0 })
  @ApiPropertyOptional()
  IsWithinNVZ: boolean;

  @Column('bit', { nullable: true, default: 0 })
  @ApiPropertyOptional()
  IsAbove300SeaLevel: boolean;

  @Column('bit', { default: 1 })
  @ApiProperty()
  IsActive: boolean;

  @Column('datetime2', { nullable: true, precision: 7, default: 'GETDATE()' })
  CreatedOn: Date;

  @Column('int', { nullable: true })
  CreatedByID: number;

  @ManyToOne(() => UserEntity, (user) => user.CreatedFields)
  @JoinColumn({ name: 'CreatedByID' })
  CreatedByUser: UserEntity;

  @Column('datetime2', { nullable: true, precision: 7 })
  ModifiedOn: Date;

  @Column('int', { nullable: true })
  ModifiedByID: number;

  @ManyToOne(() => UserEntity, (user) => user.ModifiedFields)
  @JoinColumn({ name: 'CreatedByID' })
  ModifiedByUser: UserEntity;

  @ManyToOne(() => SubSoilEntity)
  @JoinColumn({ name: 'SubSoilID' })
  SubSoil: SubSoilEntity;

  @ManyToOne(() => TopSoilEntity)
  @JoinColumn({ name: 'TopSoilID' })
  TopSoil: TopSoilEntity;

  @OneToMany(() => CropEntity, (crop) => crop.Field)
  Crops: CropEntity[];

  @OneToMany(() => SoilAnalysisEntity, (SoilAnalysis) => SoilAnalysis.Field)
  SoilAnalyses: SoilAnalysisEntity[];

  @OneToMany(() => SnsAnalysesEntity, (snsAnalysis) => snsAnalysis.Field)
  SnsAnalyses: SnsAnalysesEntity[];
}
