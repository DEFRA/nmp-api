import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import FarmEntity from './farm.entity';

@Entity({ name: 'Organisations' })
export default class OrganisationEntity {
  @PrimaryColumn({ type: 'uniqueidentifier' })
  ID: string;

  @Column('nvarchar', { length: 512 })
  Name: string;

  @OneToMany(() => FarmEntity, (farm) => farm.Organisation)
  Farms: FarmEntity[];
}
