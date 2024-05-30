import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
//import UserFarmEntity from './user-farm.entity';
import FieldEntity from './field.entity';
import UserEntity from './user.entity';
import OrganisationEntity from './organisation.entity';

@Entity({ name: 'Farms' })
@Index('UC_Farms_NamePostcode', ['Name', 'Postcode'], { unique: true })
export default class FarmEntity {
  @PrimaryGeneratedColumn('identity', {
    generatedIdentity: 'ALWAYS',
    primaryKeyConstraintName: 'PK_Farms',
  })
  @PrimaryColumn({ type: 'int', insert: false })
  ID: number;

  @Column({ type: 'uniqueidentifier' })
  @ApiProperty()
  OrganisationID: string;

  @Column('nvarchar', { length: 250 })
  @ApiProperty()
  Name: string;

  @Column('nvarchar', { length: 50, nullable: true })
  @ApiPropertyOptional()
  Address1?: string;

  @Column('nvarchar', { length: 50, nullable: true })
  @ApiPropertyOptional()
  Address2?: string;

  @Column('nvarchar', { length: 50, nullable: true })
  @ApiPropertyOptional()
  Address3?: string;

  @Column('nvarchar', { length: 50, nullable: true })
  @ApiPropertyOptional()
  Address4?: string;

  @Column('nvarchar', { length: 8 })
  @ApiProperty()
  Postcode: string;

  @Column('nvarchar', { length: 50, nullable: true })
  @ApiPropertyOptional()
  CPH?: string;

  @Column('nvarchar', { length: 128, nullable: true })
  @ApiPropertyOptional()
  FarmerName?: string;

  @Column('nvarchar', { length: 128, nullable: true })
  @ApiPropertyOptional()
  BusinessName?: string;

  @Column('nvarchar', { length: 20, nullable: true })
  @ApiPropertyOptional()
  SBI?: string;

  @Column('nvarchar', { length: 6, nullable: true })
  @ApiPropertyOptional()
  STD?: string;

  @Column('nvarchar', { length: 15, nullable: true })
  @ApiPropertyOptional()
  Telephone?: string;

  @Column('nvarchar', { length: 13, nullable: true })
  @ApiPropertyOptional()
  Mobile?: string;

  @Column('nvarchar', { length: 256, nullable: true })
  @ApiPropertyOptional()
  Email?: string;

  @Column('decimal', { precision: 18, scale: 5, nullable: true })
  @ApiPropertyOptional()
  Rainfall?: number;

  @Column('decimal', { precision: 18, scale: 4, default: 0 })
  @ApiPropertyOptional()
  TotalFarmArea: number;

  @Column('int', { default: 0 })
  @ApiProperty()
  AverageAltitude: number;

  @Column('bit', { default: 0 })
  @ApiProperty()
  RegisteredOrganicProducer: boolean;

  @Column('bit', { default: 0 })
  @ApiProperty()
  MetricUnits: boolean;

  @Column('bit', { default: 1 })
  @ApiProperty()
  EnglishRules: boolean;

  @Column('int', { default: 0 })
  @ApiProperty()
  NVZFields: number;

  @Column('int', { default: 0 })
  @ApiProperty()
  FieldsAbove300SeaLevel: number;

  @Column('datetime2', { nullable: true, precision: 7, default: 'GETDATE()' })
  @ApiPropertyOptional()
  CreatedOn: Date;

  @Column('int', { nullable: true })
  @ApiPropertyOptional()
  CreatedByID: number;

  @Column('datetime2', { nullable: true, precision: 7 })
  @ApiPropertyOptional()
  ModifiedOn: Date;

  @Column('int', { nullable: true })
  @ApiPropertyOptional()
  ModifiedByID: number;

  @ManyToOne(() => UserEntity, (user) => user.CreatedFarms)
  @JoinColumn({ name: 'CreatedByID' })
  CreatedByUser: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.ModifiedFarms)
  @JoinColumn({ name: 'CreatedByID' })
  ModifiedByUser: UserEntity;

  // @OneToMany(() => UserFarmEntity, (userFarm) => userFarm.Farm)
  // UserFarms: UserFarmEntity[];

  @OneToMany(() => FieldEntity, (field) => field.Farm)
  Fields: FieldEntity[];

  @ManyToOne(() => OrganisationEntity, (organisation) => organisation.Farms)
  @JoinColumn({ name: 'OrganisationID' })
  Organisation: OrganisationEntity;
}
