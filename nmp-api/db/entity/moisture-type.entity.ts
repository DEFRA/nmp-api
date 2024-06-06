import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { OrganicManureEntity } from './organic-manure.entity';

@Entity({ name: 'MoistureTypes' })
export class MoistureTypeEntity {
  @PrimaryGeneratedColumn('identity', {
    generatedIdentity: 'ALWAYS',
    primaryKeyConstraintName: 'PK_MoistureTypes',
  })
  @PrimaryColumn({ type: 'int', insert: false })
  ID: number;

  @Column('nvarchar', { length: 100 })
  Name: string;

  @OneToMany(
    () => OrganicManureEntity,
    (organicManure) => organicManure.MoistureTypes,
  )
  OrganicManures: OrganicManureEntity[];
}
