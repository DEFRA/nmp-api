import { Entity, PrimaryColumn } from 'typeorm';

@Entity('SecondCropLinkings')
export class SecondCropLinkingEntity {
  @PrimaryColumn({ type: 'int' })
  FirstCropID: number;

  @PrimaryColumn({ type: 'int' })
  SecondCropID: number;
}
