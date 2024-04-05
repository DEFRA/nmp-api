import FarmEntity from './farm.entity';
import RoleEntity from './role.entity';
import UserEntity from './user.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';

@Entity({ name: 'UserFarns' })
@Index('PK_UserFarms', ['UserID', 'FarmID'], { unique: true })
export default class UserFarmsEntity {
  @ManyToOne(() => UserEntity, (user) => user.UserFarms)
  @JoinColumn({ name: 'UserID' })
  User: UserEntity;

  @OneToOne(() => FarmEntity)
  @JoinColumn({ name: 'FarmID' })
  Farm: FarmEntity;

  @ManyToOne(() => RoleEntity, (role) => role.UserFarms)
  @JoinColumn({ name: 'RoleID' })
  Role: RoleEntity;

  @Column('int')
  UserID: number;

  @Column('int')
  FarmID: number;

  @Column('int')
  RoleID: number;
}
