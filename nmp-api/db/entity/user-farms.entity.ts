import { Farm } from './farm.entity';
import { Role } from './role.entity';
import { User } from './user.entity';
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
export class UserFarms {
  @ManyToOne(() => User, (user) => user.UserFarms)
  @JoinColumn({ name: 'UserID' })
  User: User;

  @OneToOne(() => Farm)
  @JoinColumn({ name: 'FarmID' })
  Farm: Farm;

  @ManyToOne(() => Role, (role) => role.UserFarms)
  @JoinColumn({ name: 'RoleID' })
  Role: Role;

  @Column('int')
  UserID: number;

  @Column('int')
  FarmID: number;

  @Column('int')
  RoleID: number;
}
