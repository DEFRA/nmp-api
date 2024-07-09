import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  PrimaryColumn,
  OneToMany,
} from 'typeorm';
import { SoilTypeSoilTextureEntity } from './soil-type-soil-texture.entity';
import FieldEntity from './field.entity';

@Entity('SubSoils')
export class SubSoilEntity {
  @PrimaryGeneratedColumn('identity', {
    generatedIdentity: 'ALWAYS',
    primaryKeyConstraintName: 'PK_SubSoils',
  })
  @PrimaryColumn({ type: 'int', insert: false })
  ID: number;

  @Column({ type: 'nvarchar', length: 100 })
  Name: string;

  @OneToMany(
    () => SoilTypeSoilTextureEntity,
    (soilTypeSoilTexture) => soilTypeSoilTexture.SubSoil,
  )
  @JoinColumn({ name: 'ID' })
  SoilTypeSoilTextures: SoilTypeSoilTextureEntity[];

  @OneToMany(() => FieldEntity, (field) => field.SubSoil)
  @JoinColumn({ name: 'ID' })
  Fields: FieldEntity[];
}
