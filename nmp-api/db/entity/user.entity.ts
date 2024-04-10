import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import UserFarmsEntity from './user-farms.entity';

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
}
