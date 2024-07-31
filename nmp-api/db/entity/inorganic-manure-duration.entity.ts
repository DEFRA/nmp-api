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
  ApplicationDate: number;

  @Column({ type: 'int' })
  ApplicationMonth: number;
}
