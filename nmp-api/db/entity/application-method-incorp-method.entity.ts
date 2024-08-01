import { Entity, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { ApplicationMethodEntity } from './application-method.entity';
import { IncorporationMethodEntity } from './incorporation-method.entity';

@Entity({ name: 'ApplicationMethodsIncorpMethods' })
export class ApplicationMethodsIncorpMethodEntity {
  @PrimaryColumn({ type: 'int' })
  ApplicationMethodID: number;

  @PrimaryColumn({ type: 'int' })
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
