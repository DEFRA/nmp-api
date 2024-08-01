import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { SoilTypeSoilTextureEntity } from './soil-type-soil-texture.entity';
import FieldEntity from './field.entity';

@Entity('TopSoils')
export class TopSoilEntity {
  @PrimaryGeneratedColumn('identity', {
    generatedIdentity: 'ALWAYS',
    primaryKeyConstraintName: 'PK_TopSoils',
  })
  @PrimaryColumn({ type: 'int', insert: false })
  ID: number;

  @Column({ type: 'nvarchar', length: 100 })
  Name: string;

  @OneToMany(
    () => SoilTypeSoilTextureEntity,
    (soilTypeSoilTexture) => soilTypeSoilTexture.TopSoil,
  )
  @JoinColumn({ name: 'ID' })
  SoilTypeSoilTextures: SoilTypeSoilTextureEntity[];

  @OneToMany(() => FieldEntity, (field) => field.TopSoil)
  @JoinColumn({ name: 'ID' })
  Fields: FieldEntity[];
}
