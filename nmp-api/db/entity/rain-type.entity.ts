import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { OrganicManureEntity } from './organic-manure.entity';

@Entity({ name: 'RainTypes' })
export class RainTypeEntity {
  @PrimaryGeneratedColumn('identity', {
    generatedIdentity: 'ALWAYS',
    primaryKeyConstraintName: 'PK_RainTypes',
  })
  @PrimaryColumn({ type: 'int', insert: false })
  ID: number;

  @Column('nvarchar', { length: 100 })
  Name: string;

  @Column('int')
  RainInMM: number;

  @OneToMany(
    () => OrganicManureEntity,
    (organicManure) => organicManure.RainTypes,
  )
  OrganicManures: OrganicManureEntity[];
}
