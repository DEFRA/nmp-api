import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import FarmEntity from './farm.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'Organisations' })
export default class OrganisationEntity {
  @PrimaryColumn({ type: 'uniqueidentifier' })
  @ApiProperty()
  ID: string;

  @Column('nvarchar', { length: 512 })
  @ApiProperty()
  Name: string;

  @OneToMany(() => FarmEntity, (farm) => farm.Organisation)
  Farms: FarmEntity[];
}
