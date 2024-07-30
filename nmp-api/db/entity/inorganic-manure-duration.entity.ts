import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn } from 'typeorm';

@Entity({ name: 'InOrganicManureDurations' })
export class InOrganicManureDurationEntity {
  @PrimaryGeneratedColumn('identity', {
    generatedIdentity: 'ALWAYS',
    primaryKeyConstraintName: 'PK_InOrganicManureDurations',
  })
  @PrimaryColumn({ type: 'int', insert: false })
  ID: number;

  @Column({ type: 'nvarchar', length: 100 })
  Name: string;

  @Column({ type: 'int' })
  StartDate: number;

  @Column({ type: 'int' })
  StartMonth: number;

  @Column({ type: 'int' })
  EndDate: number;

  @Column({ type: 'int' })
  EndMonth: number;
}
