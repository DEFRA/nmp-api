import {
  Entity,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrganicManureEntity } from './organic-manure.entity';
import { ManureGroupEntity } from './manure-group.entity';
import { CountryEntity } from './country.entity';

@Entity({ name: 'ManureTypes' })
export class ManureTypeEntity {
  @PrimaryGeneratedColumn('identity', {
    generatedIdentity: 'ALWAYS',
    primaryKeyConstraintName: 'PK_ManureTypes',
  })
  @PrimaryColumn({
    type: 'int',
    insert: false,
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

  @Column('decimal', { precision: 18, scale: 2, nullable: false })
  DryMatter: number;

  @Column('decimal', { precision: 18, scale: 2, nullable: false })
  TotalN: number;

  @Column('decimal', { precision: 18, scale: 2, nullable: false })
  NH4N: number;

  @Column('decimal', { precision: 18, scale: 2, nullable: false })
  Uric: number;

  @Column('decimal', { precision: 18, scale: 2, nullable: false })
  NO3N: number;

  @Column('decimal', { precision: 18, scale: 2, nullable: false })
  P2O5: number;

  @Column('decimal', { precision: 18, scale: 2, nullable: false })
  K2O: number;

  @Column('decimal', { precision: 18, scale: 2, nullable: false })
  SO3: number;

  @Column('decimal', { precision: 18, scale: 2, nullable: false })
  MgO: number;

  @Column({ type: 'int', nullable: false })
  P2O5Available: number;

  @Column({ type: 'int', nullable: false })
  K2OAvailable: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: false })
  NMaxConstant: number;

  @Column({ type: 'int', nullable: false })
  ApplicationRateArable: number;

  @Column({ type: 'int', nullable: false })
  ApplicationRateGrass: number;

  @OneToMany(
    () => OrganicManureEntity,
    (organicManure) => organicManure.ManureTypes,
  )
  OrganicManures: OrganicManureEntity[];

  @ManyToOne(() => ManureGroupEntity, (manureGroup) => manureGroup.ManureTypes)
  @JoinColumn({ name: 'ManureGroupID' })
  ManureGroups: ManureGroupEntity;

  @ManyToOne(() => CountryEntity, (country) => country.ManureTypes)
  @JoinColumn({ name: 'CountryID' })
  Countries: CountryEntity;
}
