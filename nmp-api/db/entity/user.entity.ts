import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import UserFarmsEntity from './user-farms.entity';
import FieldEntity from './field.entity';
import FarmEntity from './farm.entity';

@Entity({ name: 'Users' })
export default class UserEntity {
  @PrimaryGeneratedColumn('identity', { generatedIdentity: 'ALWAYS' })
  ID: number;

  @Column('nvarchar', { length: 50 })
  GivenName: string;

  @Column('nvarchar', { length: 50 })
  Surname?: string;

  @Column('nvarchar', { length: 256 })
  Email: string;

  @Column('nvarchar', { length: 128, unique: true })
  UserName: string;

  @OneToMany(() => UserFarmsEntity, (userFarms) => userFarms.User)
  UserFarms: UserFarmsEntity[];

  @OneToMany(() => FieldEntity, (field) => field.CreatedByUser)
  CreatedFields: FieldEntity[];

  @OneToMany(() => FieldEntity, (field) => field.ModifiedByUser)
  ModifiedFields: FieldEntity[];

  @OneToMany(() => FarmEntity, (farm) => farm.CreatedByUser)
  CreatedFarms: FarmEntity[];

  @OneToMany(() => FarmEntity, (farm) => farm.ModifiedByUser)
  ModifiedFarms: FarmEntity[];
}
