import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ManureTypeEntity } from './manure-type.entity';
import { ApplicationMethodEntity } from './application-method.entity';

@Entity({ name: 'ManureTypesApplicationMethods' })
export class ManureTypesApplicationMethodEntity {
  @PrimaryColumn({ type: 'uuid', insert: false, select: false, update: false })
  ID: never;

  @Column('int')
  ManureTypeID: number;

  @Column('int')
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
