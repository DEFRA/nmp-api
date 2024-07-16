import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ManureTypeEntity } from './manure-type.entity';

@Entity({ name: 'ManureTypeCategories' })
export class ManureTypeCategoryEntity {
  @PrimaryGeneratedColumn()
  ID: number;

  @Column('nvarchar', { length: 250 })
  Name: string;

  @OneToMany(
    () => ManureTypeEntity,
    (manureType) => manureType.ManureTypeCategory,
  )
  ManureTypes: ManureTypeEntity[];
}
