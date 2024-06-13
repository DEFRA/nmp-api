import {
  Entity,
  Column,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApplicationMethodsIncorpMethodEntity } from './application-method-incorp-method.entity';
import { OrganicManureEntity } from './organic-manure.entity';

@Entity({ name: 'ApplicationMethods' })
export class ApplicationMethodEntity {
  @PrimaryGeneratedColumn('identity', {
    generatedIdentity: 'ALWAYS',
    primaryKeyConstraintName: 'PK_ApplicationMethods',
  })
  @PrimaryColumn({
    type: 'int',
    insert: false,
  })
  ID: number;

  @Column('nvarchar', { length: 100 })
  Name: string;

  @Column('nvarchar', { length: 1, nullable: false })
  ApplicableFor: string;

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
}
