import UserFarmEntity from './user-farm.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'Roles' })
export default class RoleEntity {
  @PrimaryGeneratedColumn('identity', { generatedIdentity: 'ALWAYS' })
  ID: number;

  @Column('nvarchar', { length: 256, unique: true })
  Name: string;

  @OneToMany(() => UserFarmEntity, (userFarm) => userFarm.Role)
  UserFarms: UserFarmEntity[];
}
