import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { ApplicationMethodsIncorpMethodEntity } from './application-method-incorp-method.entity';
import { OrganicManureEntity } from './organic-manure.entity';
import { ManureTypesApplicationMethodEntity } from './manure-type-application-method.entity';

@Entity({ name: 'ApplicationMethods' })
export class ApplicationMethodEntity {
  @PrimaryGeneratedColumn('identity', {
    generatedIdentity: 'ALWAYS',
    primaryKeyConstraintName: 'PK_ApplicationMethods',
  })
  @PrimaryColumn({ type: 'int', insert: false })
  ID: number;

  @Column('nvarchar', { length: 100 })
  Name: string;

  @OneToMany(
    () => ApplicationMethodsIncorpMethodEntity,
    (applicationMethodsIncorpMethod) =>
      applicationMethodsIncorpMethod.ApplicationMethods,
  )
  ApplicationMethodsIncorpMethods: ApplicationMethodsIncorpMethodEntity[];

  @OneToMany(
    () => OrganicManureEntity,
    (organicManure) => organicManure.ApplicationMethods,
  )
  OrganicManures: OrganicManureEntity[];

  @OneToMany(
    () => ManureTypesApplicationMethodEntity,
    (manureTypesApplicationMethod) =>
      manureTypesApplicationMethod.ApplicationMethods,
  )
  ManureTypesApplicationMethods: ManureTypesApplicationMethodEntity[];
}
