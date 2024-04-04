import { UserFarms } from './user-farms.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Roles' })
export class Role {
  @PrimaryGeneratedColumn('identity', { generatedIdentity: 'ALWAYS' })
  ID: number;

  @Column('nvarchar', { length: 256, unique: true })
  Name: string;

  @OneToMany(() => UserFarms, (userFarms) => userFarms.Role)
  UserFarms: UserFarms[];
}
