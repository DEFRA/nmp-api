import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import ManagementPeriodEntity from './management-period.entity';
import { ManureTypeEntity } from './manure-type.entity';
import { ApplicationMethodEntity } from './application-method.entity';
import { IncorporationMethodEntity } from './incorporation-method.entity';
import { IncorporationDelayEntity } from './incorporation-delay.entity';
import { WindspeedEntity } from './wind-speed.entity';
import { RainTypeEntity } from './rain-type.entity';
import { MoistureTypeEntity } from './moisture-type.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import UserEntity from './user.entity';

@Entity({ name: 'OrganicManures' })
export class OrganicManureEntity {
  @PrimaryGeneratedColumn('identity', {
    generatedIdentity: 'ALWAYS',
    primaryKeyConstraintName: 'PK_OrganicManures',
  })
  @PrimaryColumn({ type: 'int', insert: false })
  ID: number;

  @Column('int')
  @ApiPropertyOptional()
  ManagementPeriodID: number;

  @Column('int')
  @ApiPropertyOptional()
  ManureTypeID: number;

  @Column('datetime', { nullable: true })
  @ApiPropertyOptional()
  ApplicationDate: Date;

  @Column('bit', { nullable: true })
  @ApiPropertyOptional()
  Confirm: boolean;

  @Column('decimal', { precision: 18, scale: 3 })
  @ApiProperty()
  N: number;

  @Column('decimal', { precision: 18, scale: 3 })
  @ApiProperty()
  P2O5: number;

  @Column('decimal', { precision: 18, scale: 3 })
  @ApiProperty()
  K2O: number;

  @Column('decimal', { precision: 18, scale: 3 })
  @ApiProperty()
  MgO: number;

  @Column('decimal', { precision: 18, scale: 3 })
  @ApiProperty()
  SO3: number;

  @Column('decimal', { precision: 18, scale: 3 })
  @ApiProperty()
  AvailableN: number;

  @Column('int')
  @ApiProperty()
  ApplicationRate: number;

  @Column('decimal', { precision: 18, scale: 2, nullable: false })
  @ApiProperty()
  DryMatterPercent: number;

  @Column('decimal', { precision: 18, scale: 2, nullable: false })
  @ApiProperty()
  UricAcid: number;

  @Column('datetime', { nullable: true })
  @ApiPropertyOptional()
  EndOfDrain: Date;

  @Column('int')
  @ApiProperty()
  Rainfall: number;

  @Column('decimal', { precision: 18, scale: 3, nullable: true })
  @ApiPropertyOptional()
  AreaSpread: number;

  @Column('decimal', { precision: 18, scale: 3, nullable: true })
  @ApiPropertyOptional()
  ManureQuantity: number;

  @Column('int')
  @ApiPropertyOptional()
  ApplicationMethodID: number;

  @Column('int')
  @ApiPropertyOptional()
  IncorporationMethodID: number;

  @Column('int')
  @ApiPropertyOptional()
  IncorporationDelayID: number;

  @Column('decimal', { precision: 18, scale: 3 })
  @ApiProperty()
  NH4N: number;

  @Column('decimal', { precision: 18, scale: 3 })
  @ApiProperty()
  NO3N: number;

  @Column('decimal', { precision: 18, scale: 3, nullable: true })
  @ApiPropertyOptional()
  AvailableP2O5: number;

  @Column('decimal', { precision: 18, scale: 3, nullable: true })
  @ApiPropertyOptional()
  AvailableK2O: number;

  @Column('int', { nullable: true })
  @ApiPropertyOptional()
  WindspeedID: number;

  @Column('int', { nullable: true })
  @ApiPropertyOptional()
  RainfallWithinSixHoursID: number;

  @Column('int', { nullable: true })
  @ApiPropertyOptional()
  MoistureID: number;

  @Column('datetime2', { nullable: true, precision: 7, default: 'GETDATE()' })
  CreatedOn: Date;

  @Column('int', { nullable: true })
  CreatedByID: number;

  @ManyToOne(() => UserEntity, (user) => user.CreatedOrganicManures)
  @JoinColumn({ name: 'CreatedByID' })
  CreatedByUser: UserEntity;

  @Column('datetime2', { nullable: true, precision: 7 })
  ModifiedOn: Date;

  @Column('int', { nullable: true })
  ModifiedByID: number;

  @ManyToOne(() => UserEntity, (user) => user.ModifiedOrganicManures)
  @JoinColumn({ name: 'CreatedByID' })
  ModifiedByUser: UserEntity;

  @ManyToOne(
    () => ManagementPeriodEntity,
    (managementPeriod) => managementPeriod.OrganicManures,
  )
  @JoinColumn({ name: 'ManagementPeriodID' })
  ManagementPeriods: ManagementPeriodEntity;

  @ManyToOne(() => ManureTypeEntity, (manureType) => manureType.OrganicManures)
  @JoinColumn({ name: 'ManureTypeID' })
  ManureTypes: ManureTypeEntity;

  @ManyToOne(
    () => ApplicationMethodEntity,
    (applicationMethod) => applicationMethod.OrganicManures,
  )
  @JoinColumn({ name: 'ApplicationMethodID' })
  ApplicationMethods: ApplicationMethodEntity;

  @ManyToOne(
    () => IncorporationMethodEntity,
    (incorporationMethod) => incorporationMethod.OrganicManures,
  )
  @JoinColumn({ name: 'IncorporationMethodID' })
  IncorporationMethods: IncorporationMethodEntity;

  @ManyToOne(
    () => IncorporationDelayEntity,
    (incorporationDelay) => incorporationDelay.OrganicManures,
  )
  @JoinColumn({ name: 'IncorporationDelayID' })
  IncorporationDelays: IncorporationDelayEntity;

  @ManyToOne(() => WindspeedEntity, (windspeed) => windspeed.OrganicManures)
  @JoinColumn({ name: 'WindspeedID' })
  Windspeeds: WindspeedEntity;

  @ManyToOne(() => RainTypeEntity, (rainType) => rainType.OrganicManures)
  @JoinColumn({ name: 'RainfallWithinSixHoursID' })
  RainTypes: RainTypeEntity;

  @ManyToOne(
    () => MoistureTypeEntity,
    (moistureType) => moistureType.OrganicManures,
  )
  @JoinColumn({ name: 'MoistureID' })
  MoistureTypes: MoistureTypeEntity;
}
