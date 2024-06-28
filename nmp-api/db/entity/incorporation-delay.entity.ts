import {
  Entity,
  Column,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IncorpMethodsIncorpDelayEntity } from './incorp-method-incorp-delay.entity';
import { OrganicManureEntity } from './organic-manure.entity';

@Entity({ name: 'IncorporationDelays' })
export class IncorporationDelayEntity {
  @PrimaryGeneratedColumn('identity', {
    generatedIdentity: 'ALWAYS',
    primaryKeyConstraintName: 'PK_IncorporationDelays',
  })
  @PrimaryColumn({
    name: 'ID',
    insert: false,
  })
  ID: number;

  @Column('nvarchar', { length: 100 })
  Name: string;

  @Column('int', { nullable: true })
  FromHours: number;

  @Column('int', { nullable: true })
  ToHours: number;

  @Column({ type: 'nvarchar', length: 1, nullable: true })
  ApplicableFor: string;

  @OneToMany(
    () => IncorpMethodsIncorpDelayEntity,
    (incorpMethodsIncorpDelay) => incorpMethodsIncorpDelay.IncorporationDelay,
  )
  IncorpMethodsIncorpDelays: IncorpMethodsIncorpDelayEntity[];

  @OneToMany(
    () => OrganicManureEntity,
    (organicManure) => organicManure.IncorporationDelays,
  )
  OrganicManures: OrganicManureEntity[];
}
