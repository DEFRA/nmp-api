import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Farms' })
export default class FarmEntity {
  @PrimaryGeneratedColumn('identity', {
    generatedIdentity: 'ALWAYS',
    primaryKeyConstraintName: 'PK_Farms',
  })
  ID: number;

  @Column('nvarchar', { length: 50 })
  Name: string;

  @Column('nvarchar', { length: 50, nullable: true })
  Address1?: string;

  @Column('nvarchar', { length: 50, nullable: true })
  Address2?: string;

  @Column('nvarchar', { length: 50, nullable: true })
  Address3?: string;

  @Column('nvarchar', { length: 50, nullable: true })
  Address4?: string;

  @Column('nvarchar', { length: 50 })
  PostCode: string;

  @Column('nvarchar', { length: 50, nullable: true })
  CPH?: string;

  @Column('nvarchar', { length: 128, nullable: true })
  FarmerName?: string;

  @Column('nvarchar', { length: 128, nullable: true })
  BusinessName?: string;

  @Column('nvarchar', { length: 20, nullable: true })
  SBI?: string;

  @Column('nvarchar', { length: 6, nullable: true })
  STD?: string;

  @Column('nvarchar', { length: 15, nullable: true })
  Telephone?: string;

  @Column('nvarchar', { length: 13, nullable: true })
  Mobile?: string;

  @Column('nvarchar', { length: 256, nullable: true })
  Email?: string;

  @Column('int', { nullable: true })
  Rainfall?: number;

  @Column('decimal', { precision: 18, scale: 4, default: 0 })
  TotalFarmArea: number;

  @Column('int', { default: 0 })
  AverageAltitude: number;

  @Column('bit', { default: 0 })
  RegistredOrganicProducer: boolean;

  @Column('bit', { default: 0 })
  MetricUnits: boolean;

  @Column('bit', { default: 1 })
  EnglishRules: boolean;

  @Column('int', { default: 0 })
  NVZFields: number;

  @Column('int', { default: 0 })
  FieldsAbove300SeaLevel: number;
}
