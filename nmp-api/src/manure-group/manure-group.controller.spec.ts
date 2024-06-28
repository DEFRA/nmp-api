import { Test, TestingModule } from '@nestjs/testing';
import { ManureGroupController } from './manure-group.controller';
import { ManureGroupService } from './manure-group.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ormConfig } from '../../test/ormConfig';
import { ManureGroupEntity } from '@db/entity/manure-group.entity';
import { EntityManager } from 'typeorm';
import { truncateAllTables } from '../../test/utils';

describe('ManureGroupController', () => {
  let controller: ManureGroupController;
  let entityManager: EntityManager;
  let manureGroupRepository: any;
  let manureGroup: ManureGroupEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(ormConfig),
        TypeOrmModule.forFeature([ManureGroupEntity]),
      ],
      controllers: [ManureGroupController],
      providers: [ManureGroupService],
    }).compile();

    controller = module.get<ManureGroupController>(ManureGroupController);
    entityManager = module.get<EntityManager>(EntityManager);
    manureGroupRepository = entityManager.getRepository(ManureGroupEntity);
    await truncateAllTables(entityManager);
    manureGroup = await manureGroupRepository.save({
      Name: 'Livestock manure'
    });
  });

  describe('Get All Manure Groups', () => {
    it('should return an array of manure groups', async () => {
      const result = await controller.getAllManureGroups();
      expect(result.ManureGroups).toBeDefined();
    });
  });

  describe('Get Manure Group By Manure GroupId', () => {
    it('should return a manure group by manureGroupId', async () => {
      const manureGroupId = manureGroup.ID;
      const result =
        await controller.getManureGroupByManureGroupId(manureGroupId);
      expect(result.ManureGroup).toBeDefined();
      expect(result.ManureGroup).toHaveProperty('ID');
    });
  });
});
