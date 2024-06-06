import {
  Entity,
  PrimaryColumn,
  Column,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ManureTypeEntity } from './manure-type.entity';

@Entity({ name: 'ManureGroups' })
export class ManureGroupEntity {
  @PrimaryGeneratedColumn()
  @PrimaryColumn({ type: 'int', insert: false })
  ID: number;

  @Column('nvarchar', { length: 50 })
  Name: string;

  @OneToMany(() => ManureTypeEntity, (manureType) => manureType.ManureGroups)
  ManureTypes: ManureTypeEntity[];
}
