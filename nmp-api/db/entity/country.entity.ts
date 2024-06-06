import {
  Column,
  Entity,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { ManureTypeEntity } from './manure-type.entity';

@Entity({ name: 'Countries' })
export class CountryEntity {
  @PrimaryGeneratedColumn()
  @PrimaryColumn({ type: 'int', insert: false })
  Id: number;

  @Column('nvarchar', { length: 50 })
  Name: string;

  @OneToMany(() => ManureTypeEntity, (manureType) => manureType.Countries)
  ManureTypes: ManureTypeEntity[];
}
