import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { MannerCropTypeEntity } from './manner-crop-type.entity';

@Entity({ name: 'CropTypeLinkings' })
export class CropTypeLinkingEntity {
  @PrimaryColumn()
  CropTypeID: number;

  @PrimaryColumn()
  MannerCropTypeID: number;

  @ManyToOne(
    () => MannerCropTypeEntity,
    (cropType) => cropType.CropTypeLinkings,
  )
  @JoinColumn({ name: 'MannerCropTypeID' })
  MannerCropType: MannerCropTypeEntity;
}
