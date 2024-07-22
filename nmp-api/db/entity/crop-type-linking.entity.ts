import { Entity, PrimaryColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { MannerCropTypeEntity } from './manner-crop-type.entity';

@Entity({ name: 'CropTypeLinkings' })
export class CropTypeLinkingEntity {
  @PrimaryColumn()
  CropTypeID: number;

  @PrimaryColumn()
  MannerCropTypeID: number;

  @Column('decimal', { precision: 18, scale: 3, nullable: true })
  DefaultYield: number;

  @ManyToOne(
    () => MannerCropTypeEntity,
    (cropType) => cropType.CropTypeLinkings,
  )
  @JoinColumn({ name: 'MannerCropTypeID' })
  MannerCropType: MannerCropTypeEntity;
}
