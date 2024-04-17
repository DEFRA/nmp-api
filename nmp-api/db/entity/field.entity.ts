import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import FarmEntity from './farm.entity';
import UserEntity from './user.entity';

@Entity({ name: 'Fields' })
@Index('UC_Fields_FarmName', ['Name', 'FarmID'], { unique: true })
export default class FieldEntity {
  @PrimaryGeneratedColumn('identity', {
    generatedIdentity: 'ALWAYS',
    primaryKeyConstraintName: 'PK_Fields',
  })
  ID: number;

  @ManyToOne(() => FarmEntity, (farm) => farm.Fields)
  @JoinColumn({ name: 'FarmID' })
  Farm: FarmEntity;

  @Column('int')
  FarmID: number;

  @Column('int', { nullable: true })
  SoilTypeID: number;

  @Column('nvarchar', { length: 50, nullable: true })
  NVZProgrammeID: number;

  @Column('nvarchar', { length: 50 })
  Name: string;

  @Column('nvarchar', { length: 50, nullable: true })
  LPIDNumber: string;

  @Column('nvarchar', { length: 50, nullable: true })
  NationalGridReference: string;

  @Column('decimal', { precision: 18, scale: 3, nullable: true })
  TotalArea: number;

  @Column('decimal', { precision: 18, scale: 3, nullable: true })
  CroppedArea: number;

  @Column('decimal', { precision: 18, scale: 3, nullable: true })
  ManureNonSpreadingArea: number;

  @Column('bit', { nullable: true, default: 0 })
  SoilReleasingClay: boolean;

  @Column('bit', { nullable: true, default: 0 })
  IsWithinNVZ: boolean;

  @Column('bit', { nullable: true, default: 0 })
  IsAbove300SeaLevel: boolean;

  @Column('datetime2', { nullable: true, default: 'GETDATE()' })
  CreatedOn: Date;

  @Column('int')
  CreatedByID: number;

  @ManyToOne(() => UserEntity, (user) => user.CreatedFields)
  @JoinColumn({ name: 'CreatedByID' })
  CreatedByUser: UserEntity;

  @Column('datetime2', { nullable: true })
  ModifiedOn: Date;

  @Column('int', { nullable: true })
  ModifiedByID: number;

  @ManyToOne(() => UserEntity, (user) => user.ModifiedFields)
  @JoinColumn({ name: 'CreatedByID' })
  ModifiedByUser: UserEntity;
}
