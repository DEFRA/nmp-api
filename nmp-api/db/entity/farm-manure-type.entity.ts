import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import FarmEntity from './farm.entity';
import { ManureTypeEntity } from './manure-type.entity';
import { ApiProperty } from '@nestjs/swagger';
import UserEntity from './user.entity';

@Entity('FarmManureTypes')
export default class FarmManureTypeEntity {
  @PrimaryGeneratedColumn('identity', {
    generatedIdentity: 'ALWAYS',
    primaryKeyConstraintName: 'PK_FarmManureTypes',
  })
  @PrimaryColumn({ type: 'int', insert: false })
  ID: number;

  @ApiProperty()
  @Column()
  FarmID: number;

  @ApiProperty()
  @Column()
  ManureTypeID: number;

  @ApiProperty()
  @Column()
  FieldTypeID: number;

  @ApiProperty()
  @Column('decimal', { precision: 18, scale: 2 })
  DryMatter: number;

  @ApiProperty()
  @Column('decimal', { precision: 18, scale: 2 })
  TotalN: number;

  @ApiProperty()
  @Column('decimal', { precision: 18, scale: 2 })
  NH4N: number;

  @ApiProperty()
  @Column('decimal', { precision: 18, scale: 2 })
  Uric: number;

  @ApiProperty()
  @Column('decimal', { precision: 18, scale: 2 })
  NO3N: number;

  @ApiProperty()
  @Column('decimal', { precision: 18, scale: 2 })
  P2O5: number;

  @ApiProperty()
  @Column('decimal', { precision: 18, scale: 2 })
  K2O: number;

  @ApiProperty()
  @Column('decimal', { precision: 18, scale: 2 })
  SO3: number;

  @ApiProperty()
  @Column('decimal', { precision: 18, scale: 2 })
  MgO: number;

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

  @ManyToOne(() => FarmEntity, (farm) => farm.farmManureTypes)
  @JoinColumn({ name: 'FarmID' })
  farm: FarmEntity;

  @ManyToOne(() => ManureTypeEntity, (manureType) => manureType.farmManureTypes)
  @JoinColumn({ name: 'ManureTypeID' })
  manureType: ManureTypeEntity;
}
