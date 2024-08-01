import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import UserEntity from './user.entity';
import ManagementPeriodEntity from './management-period.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity({ name: 'FertiliserManures' })
export class FertiliserManuresEntity {
  @PrimaryGeneratedColumn('identity', {
    generatedIdentity: 'ALWAYS',
    primaryKeyConstraintName: 'PK_FertiliserManures',
  })
  @PrimaryColumn({ type: 'int', insert: false })
  ID: number;

  @Column()
  @ApiProperty()
  ManagementPeriodID: number;

  @Column({ type: 'datetime' })
  @ApiProperty()
  ApplicationDate: Date;

  @Column()
  @ApiProperty()
  ApplicationRate: number;

  @Column({ type: 'bit', nullable: true })
  @ApiPropertyOptional()
  Confirm: boolean;

  @Column({ type: 'decimal', precision: 18, scale: 3 })
  @ApiProperty()
  N: number;

  @Column({ type: 'decimal', precision: 18, scale: 3 })
  @ApiProperty()
  P2O5: number;

  @Column({ type: 'decimal', precision: 18, scale: 3 })
  @ApiProperty()
  K2O: number;

  @Column({ type: 'decimal', precision: 18, scale: 3 })
  @ApiProperty()
  MgO: number;

  @Column({ type: 'decimal', precision: 18, scale: 3 })
  @ApiProperty()
  SO3: number;

  @Column({ type: 'decimal', precision: 18, scale: 3 })
  @ApiProperty()
  Na2O: number;

  @Column({ type: 'decimal', precision: 18, scale: 3 })
  @ApiProperty()
  NFertAnalysisPercent: number;

  @Column({ type: 'decimal', precision: 18, scale: 3 })
  @ApiProperty()
  P2O5FertAnalysisPercent: number;

  @Column({ type: 'decimal', precision: 18, scale: 3 })
  @ApiProperty()
  K2OFertAnalysisPercent: number;

  @Column({ type: 'decimal', precision: 18, scale: 3 })
  @ApiProperty()
  MgOFertAnalysisPercent: number;

  @Column({ type: 'decimal', precision: 18, scale: 3 })
  @ApiProperty()
  SO3FertAnalysisPercent: number;

  @Column({ type: 'decimal', precision: 18, scale: 3 })
  @ApiProperty()
  Na2OFertAnalysisPercent: number;

  @Column({ type: 'decimal', precision: 18, scale: 3 })
  @ApiProperty()
  Lime: number;

  @Column({ type: 'decimal', precision: 18, scale: 3 })
  @ApiProperty()
  NH4N: number;

  @Column({ type: 'decimal', precision: 18, scale: 3 })
  @ApiProperty()
  NO3N: number;

  @Column({ type: 'datetime2', nullable: true, default: () => 'GETDATE()' })
  CreatedOn: Date;

  @Column({ nullable: true, default: 0 })
  CreatedByID: number;

  @Column({ type: 'datetime2', nullable: true, default: () => 'GETDATE()' })
  ModifiedOn: Date;

  @Column({ nullable: true, default: 0 })
  ModifiedByID: number;

  @ManyToOne(
    () => ManagementPeriodEntity,
    (managementPeriod) => managementPeriod.FertiliserManures,
  )
  @JoinColumn({ name: 'ManagementPeriodID' })
  ManagementPeriod: ManagementPeriodEntity;

  @ManyToOne(() => UserEntity, (user) => user.CreatedFertiliserManures)
  @JoinColumn({ name: 'CreatedByID' })
  CreatedByUser: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.ModifiedFertiliserManures)
  @JoinColumn({ name: 'ModifiedByID' })
  ModifiedByUser: UserEntity;
}
