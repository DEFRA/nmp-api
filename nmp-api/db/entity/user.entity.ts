import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserFarms } from './user-farms.entity';

@Entity({ name: 'Users' })
export class User {
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

  @OneToMany(() => UserFarms, (userFarms) => userFarms.User)
  UserFarms: UserFarms[];
}
