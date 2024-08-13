import { Entity, PrimaryColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { MannerCropTypeEntity } from './manner-crop-type.entity';

@Entity({ name: 'CropTypeLinkings' })
export class CropTypeLinkingEntity {
  @PrimaryColumn()
  CropTypeID: number;

  @PrimaryColumn()
  MannerCropTypeID: number;

  @Column('decimal', { precision: 18, scale: 1, nullable: true })
  DefaultYield: number;

  @Column({ name: 'IsPerennial', type: 'bit' })
  IsPerennial: boolean;

  @ManyToOne(
    () => MannerCropTypeEntity,
    (cropType) => cropType.CropTypeLinkings,
  )
  @JoinColumn({ name: 'MannerCropTypeID' })
  MannerCropType: MannerCropTypeEntity;
}
