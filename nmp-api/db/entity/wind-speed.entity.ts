import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { OrganicManureEntity } from './organic-manure.entity';

@Entity({ name: 'Windspeeds' })
export class WindspeedEntity {
  @PrimaryGeneratedColumn('identity', {
    generatedIdentity: 'ALWAYS',
    primaryKeyConstraintName: 'PK_Windspeeds',
  })
  @PrimaryColumn({ type: 'int', insert: false })
  ID: number;

  @Column('nvarchar', { length: 100 })
  Name: string;

  @Column('int')
  FromScale: number;

  @Column('int')
  ToScale: number;

  @OneToMany(
    () => OrganicManureEntity,
    (organicManure) => organicManure.Windspeeds,
  )
  OrganicManures: OrganicManureEntity[];
}
