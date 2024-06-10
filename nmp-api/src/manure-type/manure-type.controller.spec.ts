import { Test, TestingModule } from '@nestjs/testing';
import { ManureTypeController } from './manure-type.controller';
import { ManureTypeService } from './manure-type.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ormConfig } from '../../test/ormConfig';
import { ManureTypeEntity } from '@db/entity/manure-type.entity';
import { truncateAllTables } from '../../test/utils';
import { EntityManager } from 'typeorm';
import { HttpStatus } from '@nestjs/common';

describe('ManureTypeController', () => {
  let controller: ManureTypeController;
  let entityManager: EntityManager;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(ormConfig),
        TypeOrmModule.forFeature([ManureTypeEntity]),
      ],
      controllers: [ManureTypeController],
      providers: [ManureTypeService],
    }).compile();

    entityManager = module.get<EntityManager>(EntityManager);
    controller = module.get<ManureTypeController>(ManureTypeController);
    await truncateAllTables(entityManager);
  });

  describe('Get Manure Types', () => {
    it('should return manure types for manureGroupId and countryId', async () => {
      const manureGroupId = 2;
      const countryId = 3;
      const result = await controller.getManureTypes(manureGroupId, countryId);
      expect(result.ManureTypes.length).toBeGreaterThan(0);
    });

    it('should throw bad request error for missing parameters', async () => {
      const manureGroupId = null;
      const countryId = null;
      try {
        await controller.getManureTypes(manureGroupId, countryId);
      } catch (error) {
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
      }
    });
  });

  describe('Get Manure Type', () => {
    it('should return manure type for given manureTypeId', async () => {
      const manureTypeId = 1;
      const result = await controller.getManureTypeByManureTypeId(manureTypeId);
      expect(result.ManureType).toBeDefined();
      expect(result.ManureType).toHaveProperty('ID');
    });
  });
});
