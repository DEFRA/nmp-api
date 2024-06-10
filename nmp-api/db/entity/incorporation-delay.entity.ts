import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { IncorpMethodsIncorpDelayEntity } from './incorp-method-incorp-delay.entity';
import { OrganicManureEntity } from './organic-manure.entity';

@Entity({ name: 'IncorporationDelays' })
export class IncorporationDelayEntity {
  @PrimaryGeneratedColumn({ name: 'ID' })
  ID: number;

  @Column('nvarchar', { length: 100 })
  Name: string;

  @Column('int')
  FromHours: number;

  @Column('int')
  ToHours: number;

  @OneToMany(
    () => IncorpMethodsIncorpDelayEntity,
    (incorpMethodsIncorpDelay) => incorpMethodsIncorpDelay.IncorporationDelay,
  )
  IncorpMethodsIncorpDelays: IncorpMethodsIncorpDelayEntity[];

  @OneToMany(
    () => OrganicManureEntity,
    (organicManure) => organicManure.IncroporationDelays,
  )
  OrganicManures: OrganicManureEntity[];
}
