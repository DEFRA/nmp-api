import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import UserEntity from '@db/entity/user.entity';
import OrganisationEntity from '@db/entity/organisation.entity';
import { OrganisationService } from '@src/organisation/organisation.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, OrganisationEntity])],
  controllers: [UserController],
  providers: [UserService, OrganisationService],
  exports: [TypeOrmModule],
})
export class UserModule {}
