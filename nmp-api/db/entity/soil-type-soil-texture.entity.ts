import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { SubSoilEntity } from './sub-soil.entity';
import { TopSoilEntity } from './top-soil.entity';

@Entity({ name: 'SoilTypeSoilTextures' })
export class SoilTypeSoilTextureEntity {
  @PrimaryColumn({ name: 'SoilTypeID', type: 'int' })
  SoilTypeID: number;

  @Column({ name: 'TopSoilID', type: 'int' })
  TopSoilID: number;

  @Column({ name: 'SubSoilID', type: 'int' })
  SubSoilID: number;

  @ManyToOne(() => TopSoilEntity)
  @JoinColumn({ name: 'TopSoilID' })
  TopSoil: TopSoilEntity;

  @ManyToOne(() => SubSoilEntity)
  @JoinColumn({ name: 'SubSoilID' })
  SubSoil: SubSoilEntity;
}
