import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import UserEntity from './user.entity';
import ManagementPeriodEntity from './management-period.entity';

@Entity({ name: 'FertiliserManures' })
export class FertiliserManuresEntity {
  @PrimaryGeneratedColumn()
  ID: number;

  @Column()
  ManagementPeriodID: number;

  @Column({ type: 'datetime' })
  ApplicationDate: Date;

  @Column()
  ApplicationRate: number;

  @Column({ type: 'bit', nullable: true })
  Confirm: boolean;

  @Column({ type: 'decimal', precision: 18, scale: 3 })
  N: number;

  @Column({ type: 'decimal', precision: 18, scale: 3 })
  P2O5: number;

  @Column({ type: 'decimal', precision: 18, scale: 3 })
  K2O: number;

  @Column({ type: 'decimal', precision: 18, scale: 3 })
  MgO: number;

  @Column({ type: 'decimal', precision: 18, scale: 3 })
  SO3: number;

  @Column({ type: 'decimal', precision: 18, scale: 3 })
  Na2O: number;

  @Column({ type: 'decimal', precision: 18, scale: 3 })
  NFertAnalysisPercent: number;

  @Column({ type: 'decimal', precision: 18, scale: 3 })
  P2O5FertAnalysisPercent: number;

  @Column({ type: 'decimal', precision: 18, scale: 3 })
  K2OFertAnalysisPercent: number;

  @Column({ type: 'decimal', precision: 18, scale: 3 })
  MgOFertAnalysisPercent: number;

  @Column({ type: 'decimal', precision: 18, scale: 3 })
  SO3FertAnalysisPercent: number;

  @Column({ type: 'decimal', precision: 18, scale: 3 })
  Na2OFertAnalysisPercent: number;

  @Column({ type: 'decimal', precision: 18, scale: 3 })
  Lime: number;

  @Column({ type: 'decimal', precision: 18, scale: 3 })
  NH4N: number;

  @Column({ type: 'decimal', precision: 18, scale: 3 })
  NO3N: number;

  @Column({ type: 'datetime2', nullable: true, default: () => 'GETDATE()' })
  CreatedOn: Date;

  @Column({ nullable: true, default: 0 })
  CreatedByID: number;

  @Column({ type: 'datetime2', nullable: true, default: () => 'GETDATE()' })
  ModifiedOn: Date;

  @Column({ nullable: true, default: 0 })
  ModifiedByID: number;

  @ManyToOne(() => ManagementPeriodEntity)
  @JoinColumn({ name: 'ManagementPeriodID' })
  managementPeriod: ManagementPeriodEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'CreatedByID' })
  createdBy: UserEntity;

  @ManyToOne(() => UserEntity, { nullable: true,eager:false })
  @JoinColumn({ name: 'ModifiedByID' })
  modifiedBy: UserEntity;
}
