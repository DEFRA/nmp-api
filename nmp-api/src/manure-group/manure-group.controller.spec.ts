import { Test, TestingModule } from '@nestjs/testing';
import { ManureGroupController } from './manure-group.controller';
import { ManureGroupService } from './manure-group.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ormConfig } from '../../test/ormConfig';
import { ManureGroupEntity } from '@db/entity/manure-group.entity';

describe('ManureGroupController', () => {
  let controller: ManureGroupController;

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
  });

  describe('Get All Manure Groups', () => {
    it('should return an array of manure groups', async () => {
      const result = await controller.getAllManureGroups();
      expect(result.ManureGroups).toBeDefined();
    });
  });

  describe('Get Manure Group By Manure GroupId', () => {
    it('should return a manure group by manureGroupId', async () => {
      const manureGroupId = 1;
      const result =
        await controller.getManureGroupByManureGroupId(manureGroupId);
      expect(result.ManureGroup).toBeDefined();
      expect(result.ManureGroup).toHaveProperty('ID');
    });
  });
});
