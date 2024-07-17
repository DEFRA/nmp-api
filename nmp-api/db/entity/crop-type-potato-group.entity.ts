import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('CropTypePotatoGroups')
export class CropTypePotatoGroupEntity {
  @PrimaryColumn({ name: 'PotatoGroupID', type: 'int' })
  PotatoGroupID: number;

  @Column({ name: 'CropTypeID', type: 'int' })
  CropTypeID: number;
}
