import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { IncorporationMethodEntity } from './incorporation-method.entity';
import { IncorporationDelayEntity } from './incorporation-delay.entity';

@Entity({ name: 'IncorpMethodsIncorpDelays' })
export class IncorpMethodsIncorpDelayEntity {
  @PrimaryColumn({ type: 'uuid', insert: false, select: false, update: false })
  ID: never;

  @Column('int')
  IncorporationMethodID: number;

  @Column('int')
  IncorporationDelayID: number;

  @ManyToOne(
    () => IncorporationMethodEntity,
    (incorporationMethod) => incorporationMethod.IncorpMethodsIncorpDelays,
  )
  @JoinColumn({ name: 'IncorporationMethodID' })
  IncorporationMethods: IncorporationMethodEntity;

  @ManyToOne(
    () => IncorporationDelayEntity,
    (incorporationDelay) => incorporationDelay.IncorpMethodsIncorpDelays,
  )
  @JoinColumn({ name: 'IncorporationDelayID' })
  IncorporationDelay: IncorporationDelayEntity;
}
