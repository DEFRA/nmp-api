import {
  Entity,
  Column,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApplicationMethodsIncorpMethodEntity } from './application-method-incorp-method.entity';
import { IncorpMethodsIncorpDelayEntity } from './incorp-method-incorp-delay.entity';
import { OrganicManureEntity } from './organic-manure.entity';

@Entity({ name: 'IncorporationMethods' })
export class IncorporationMethodEntity {
  @PrimaryGeneratedColumn('identity', {
    generatedIdentity: 'ALWAYS',
    primaryKeyConstraintName: 'PK_IncorporationMethods',
  })
  @PrimaryColumn({
    type: 'int',
    insert: false,
  })
  ID: number;

  @Column('nvarchar', { length: 100 })
  Name: string;

  @OneToMany(
    () => ApplicationMethodsIncorpMethodEntity,
    (applicationMethodsIncorpMethod) =>
      applicationMethodsIncorpMethod.IncorporationMethods,
  )
  ApplicationMethodsIncorpMethods: ApplicationMethodsIncorpMethodEntity[];

  @OneToMany(
    () => IncorpMethodsIncorpDelayEntity,
    (incorpMethodsIncorpDelay) => incorpMethodsIncorpDelay.IncorporationMethods,
  )
  IncorpMethodsIncorpDelays: IncorpMethodsIncorpDelayEntity[];

  @OneToMany(
    () => OrganicManureEntity,
    (organicManure) => organicManure.IncorporationMethods,
  )
  OrganicManures: OrganicManureEntity[];
}
