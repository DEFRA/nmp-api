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
  PrimaryColumn,
} from 'typeorm';

@Entity({ name: 'UserFarms', synchronize: false })
@Index('PK_UserFarms', ['UserID', 'FarmID'], { unique: true })
export default class UserFarmsEntity {
  @PrimaryColumn({ type: 'uuid', insert: false, select: false, update: false })
  ID: never;

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
