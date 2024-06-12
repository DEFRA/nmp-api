import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { OrganicManureEntity } from './organic-manure.entity';
import { ManureTypesApplicationMethodEntity } from './manure-type-application-method.entity';
import { ManureGroupEntity } from './manure-group.entity';
import { CountryEntity } from './country.entity';

@Entity({ name: 'ManureTypes' })
export class ManureTypeEntity {
  @PrimaryColumn({
    type: 'int',
    insert: false,
    primaryKeyConstraintName: 'PK_ManureTypes',
  })
  ID: number;

  @Column('nvarchar', { length: 100 })
  Name: string;

  @Column('int')
  ManureGroupID: number;

  @Column('int')
  CountryID: number;

  @Column({ type: 'bit' })
  HighReadilyAvailableNitrogen: boolean;

  @Column('bit')
  IsLiquid: boolean;

  @Column('decimal', { precision: 18, scale: 2, nullable: true })
  DryMatter: number;

  @Column('decimal', { precision: 18, scale: 2, nullable: true })
  TotalN: number;

  @Column('decimal', { precision: 18, scale: 2, nullable: true })
  NH4N: number;

  @Column('decimal', { precision: 18, scale: 2, nullable: true })
  Uric: number;

  @Column('decimal', { precision: 18, scale: 2, nullable: true })
  NO3N: number;

  @Column('decimal', { precision: 18, scale: 2, nullable: true })
  P2O5: number;

  @Column('decimal', { precision: 18, scale: 2, nullable: true })
  K2O: number;

  @Column('decimal', { precision: 18, scale: 2, nullable: true })
  SO3: number;

  @Column('decimal', { precision: 18, scale: 2, nullable: true })
  MgO: number;

  @Column({ type: 'int', nullable: true })
  P2O5Available: number;

  @Column({ type: 'int', nullable: true })
  K2OAvailable: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  NMaxConstant: number;

  @Column({ type: 'int', nullable: true })
  ApplicationRateArable: number;

  @Column({ type: 'int', nullable: true })
  ApplicationRateGrass: number;

  @OneToMany(
    () => OrganicManureEntity,
    (organicManure) => organicManure.ManureTypes,
  )
  OrganicManures: OrganicManureEntity[];

  @OneToMany(
    () => ManureTypesApplicationMethodEntity,
    (manureTypesApplicationMethod) => manureTypesApplicationMethod.ManureTypes,
  )
  ManureTypesApplicationMethods: ManureTypesApplicationMethodEntity[];

  @ManyToOne(() => ManureGroupEntity, (manureGroup) => manureGroup.ManureTypes)
  @JoinColumn({ name: 'ManureGroupID' })
  ManureGroups: ManureGroupEntity;

  @ManyToOne(() => CountryEntity, (country) => country.ManureTypes)
  @JoinColumn({ name: 'CountryID' })
  Countries: CountryEntity;
}
