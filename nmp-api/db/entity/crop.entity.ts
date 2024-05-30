import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import FieldEntity from './field.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import UserEntity from './user.entity';
import ManagementPeriodEntity from './management-period.entity';

@Entity({ name: 'Crops' })
export default class CropEntity {
  @PrimaryGeneratedColumn('identity', {
    generatedIdentity: 'ALWAYS',
    primaryKeyConstraintName: 'PK_Crops',
  })
  @PrimaryColumn({ type: 'int', insert: false })
  ID: number;

  @Column('int')
  FieldID: number;

  @ManyToOne(() => FieldEntity, (field) => field.Crops)
  @JoinColumn({ name: 'FieldID' })
  Field: FieldEntity;

  @Column('int')
  @ApiProperty()
  Year: number;

  @Column('int', { nullable: true })
  @ApiPropertyOptional()
  CropTypeID: number;

  @Column('nvarchar', { nullable: true, length: 100 })
  @ApiPropertyOptional()
  Variety: string;

  @Column('nvarchar', { nullable: true, length: 128 })
  @ApiPropertyOptional()
  OtherCropName: string;

  @Column('int', { nullable: true })
  @ApiPropertyOptional()
  CropInfo1: number;

  @Column('int', { nullable: true })
  @ApiPropertyOptional()
  CropInfo2: number;

  @Column('datetime', { nullable: true })
  @ApiPropertyOptional()
  SowingDate: Date;

  @Column('decimal', { nullable: true, precision: 18, scale: 3 })
  @ApiPropertyOptional()
  Yield: number;

  @Column('bit', { default: 0 })
  @ApiProperty()
  Confirm: boolean;

  @Column('int', { nullable: true })
  @ApiPropertyOptional()
  PreviousGrass: number;

  @Column('int', { nullable: true })
  @ApiPropertyOptional()
  GrassHistory: number;

  @Column('nvarchar', { nullable: true })
  @ApiPropertyOptional()
  Comments: string;

  @Column('int', { nullable: true })
  @ApiPropertyOptional()
  Establishment: number;

  @Column('int', { nullable: true })
  @ApiPropertyOptional()
  LivestockType: number;

  @Column('decimal', { nullable: true, precision: 18, scale: 3, default: 0 })
  @ApiPropertyOptional()
  MilkYield: number;

  @Column('decimal', { nullable: true, precision: 18, scale: 3, default: 0 })
  @ApiPropertyOptional()
  ConcentrateUse: number;

  @Column('decimal', { nullable: true, precision: 18, scale: 3, default: 0 })
  @ApiPropertyOptional()
  StockingRate: number;

  @Column('int', { nullable: true, default: 0 })
  @ApiPropertyOptional()
  DefoliationSequence: number;

  @Column('int', { nullable: true })
  @ApiPropertyOptional()
  GrazingIntensity: number;

  @Column('int', { nullable: true })
  @ApiPropertyOptional()
  PreviousID: number;

  @Column('datetime2', { nullable: true, precision: 7, default: 'GETDATE()' })
  CreatedOn: Date;

  @Column('int', { nullable: true })
  CreatedByID: number;

  @ManyToOne(() => UserEntity, (user) => user.CreatedCrops)
  @JoinColumn({ name: 'CreatedByID' })
  CreatedByUser: UserEntity;

  @Column('datetime2', { nullable: true, precision: 7 })
  ModifiedOn: Date;

  @Column('int', { nullable: true })
  ModifiedByID: number;

  @ManyToOne(() => UserEntity, (user) => user.ModifiedCrops)
  @JoinColumn({ name: 'CreatedByID' })
  ModifiedByUser: UserEntity;

  @OneToMany(
    () => ManagementPeriodEntity,
    (managementPeriod) => managementPeriod.Crops,
  )
  @JoinColumn({ name: 'CropID' })
  ManagementPeriods: ManagementPeriodEntity[];
}
