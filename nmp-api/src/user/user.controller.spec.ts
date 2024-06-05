import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ormConfig } from '../../test/ormConfig';
import { truncateAllTables } from '../../test/utils';
import { EntityManager } from 'typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { OrganisationService } from '@src/organisation/organisation.service';
import UserEntity from '@db/entity/user.entity';
import OrganisationEntity from '@db/entity/organisation.entity';
import { createUserWithOrganisationReqBody } from '../../test/mocked-data/user';

describe('FieldController', () => {
  let controller: UserController;
  let entityManager: EntityManager;

  beforeAll(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(ormConfig),
        TypeOrmModule.forFeature([UserEntity, OrganisationEntity]),
      ],
      controllers: [UserController],
      providers: [UserService, OrganisationService],
      exports: [TypeOrmModule],
    }).compile();

    controller = app.get<UserController>(UserController);
    entityManager = app.get<EntityManager>(EntityManager);
    await truncateAllTables(entityManager);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Create User With Organisation', () => {
    it('should create user with organisation', async () => {
      const result = await controller.createUserWithOrganisation(
        createUserWithOrganisationReqBody,
      );
      expect(result.UserID).toBeTruthy();
    });
  });
});
