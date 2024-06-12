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

@Entity({ name: 'OrganicManures' })
export class OrganicManureEntity {
  @PrimaryGeneratedColumn('identity', {
    generatedIdentity: 'ALWAYS',
    primaryKeyConstraintName: 'PK_OrganicManures',
  })
  @PrimaryColumn({ type: 'int', insert: false })
  ID: number;

  @Column('int')
  ManagementPeriodID: number;

  @Column('int')
  ManureTypeID: number;

  @Column('datetime', { nullable: true })
  ApplicationDate: Date;

  @Column('bit', { nullable: true })
  Confirm: boolean;

  @Column('decimal', { precision: 18, scale: 3 })
  N: number;

  @Column('decimal', { precision: 18, scale: 3 })
  P2O5: number;

  @Column('decimal', { precision: 18, scale: 3 })
  K2O: number;

  @Column('decimal', { precision: 18, scale: 3 })
  MgO: number;

  @Column('decimal', { precision: 18, scale: 3 })
  SO3: number;

  @Column('decimal', { precision: 18, scale: 3 })
  AvailableN: number;

  @Column('int')
  ApplicationRate: number;

  @Column('decimal', { precision: 18, scale: 2, nullable: false })
  DryMatterPercent: number;

  @Column('decimal', { precision: 18, scale: 2, nullable: false })
  UricAcid: number;

  @Column('datetime', { nullable: true })
  EndOfDrain: Date;

  @Column('int')
  Rainfall: number;

  @Column('decimal', { precision: 18, scale: 3, nullable: true })
  AreaSpread: number;

  @Column('decimal', { precision: 18, scale: 3, nullable: true })
  ManureQuantity: number;

  @Column('int')
  ApplicationMethodID: number;

  @Column('int')
  IncroporationMethodID: number;

  @Column('int')
  IncroporationDelayID: number;

  @Column('decimal', { precision: 18, scale: 3 })
  NH4N: number;

  @Column('decimal', { precision: 18, scale: 3 })
  NO3N: number;

  @Column('decimal', { precision: 18, scale: 3, nullable: true })
  AvailableP2O5: number;

  @Column('decimal', { precision: 18, scale: 3, nullable: true })
  AvailableK2O: number;

  @Column('int', { nullable: true })
  WindspeedID: number;

  @Column('int', { nullable: true })
  RainfallWithinSixHoursID: number;

  @Column('int', { nullable: true })
  MoistureID: number;

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
  @JoinColumn({ name: 'IncroporationMethodID' })
  IncorporationMethods: IncorporationMethodEntity;

  @ManyToOne(
    () => IncorporationDelayEntity,
    (incorporationDelay) => incorporationDelay.OrganicManures,
  )
  @JoinColumn({ name: 'IncroporationDelayID' })
  IncroporationDelays: IncorporationDelayEntity;

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
