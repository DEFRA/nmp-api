import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ManureTypeEntity } from './manure-type.entity';
import { ApplicationMethodEntity } from './application-method.entity';

@Entity({ name: 'ManureTypesApplicationMethods' })
export class ManureTypesApplicationMethodEntity {
  @PrimaryColumn('int')
  ManureTypeID: number;

  @PrimaryColumn('int')
  ApplicationMethodID: number;

  @ManyToOne(
    () => ManureTypeEntity,
    (manureType) => manureType.ManureTypesApplicationMethods,
  )
  @JoinColumn({ name: 'ManureTypeID' })
  ManureTypes: ManureTypeEntity;

  @ManyToOne(
    () => ApplicationMethodEntity,
    (applicationMethod) => applicationMethod.ManureTypesApplicationMethods,
  )
  @JoinColumn({ name: 'ApplicationMethodID' })
  ApplicationMethods: ApplicationMethodEntity;
}
