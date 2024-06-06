import { Entity, PrimaryColumn, ManyToOne, JoinColumn, Column } from 'typeorm';

import { ApplicationMethodEntity } from './application-method.entity';
import { IncorporationMethodEntity } from './incorporation-method.entity';

@Entity({ name: 'ApplicationMethodsIncorpMethods' })
export class ApplicationMethodsIncorpMethodEntity {
  @PrimaryColumn({ type: 'uuid', insert: false, select: false, update: false })
  ID: never;

  @Column('int')
  ApplicationMethodID: number;

  @Column('int')
  IncorporationMethodID: number;

  @ManyToOne(
    () => ApplicationMethodEntity,
    (applicationMethod) => applicationMethod.ApplicationMethodsIncorpMethods,
  )
  @JoinColumn({ name: 'ApplicationMethodID' })
  ApplicationMethods: ApplicationMethodEntity;

  @ManyToOne(
    () => IncorporationMethodEntity,
    (incorporationMethod) =>
      incorporationMethod.ApplicationMethodsIncorpMethods,
  )
  @JoinColumn({ name: 'IncorporationMethodID' })
  IncorporationMethods: IncorporationMethodEntity;
}
