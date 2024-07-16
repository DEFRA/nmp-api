import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { CropTypeLinkingEntity } from './crop-type-linking.entity';


@Entity({ name: 'MannerCropTypes' })
export class MannerCropTypeEntity {
  @PrimaryGeneratedColumn()
  ID: number;

  @Column('nvarchar', { length: 250 })
  Name: string;

  @Column('nvarchar', { length: 50 })
  Use: string;

  @Column('int', { nullable: true })
  CropUptakeFactor: number;

  @OneToMany(() => CropTypeLinkingEntity, (linking) => linking.MannerCropType)
  CropTypeLinkings: CropTypeLinkingEntity[];
}
