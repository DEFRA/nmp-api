import { Test, TestingModule } from '@nestjs/testing';
import { ManureTypeController } from './manure-type.controller';
import { ManureTypeService } from './manure-type.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ormConfig } from '../../test/ormConfig';
import { ManureTypeEntity } from '@db/entity/manure-type.entity';
import { truncateAllTables } from '../../test/utils';
import { EntityManager } from 'typeorm';
import { HttpStatus } from '@nestjs/common';
import { countryData, manureTypeData } from '../../test/mocked-data/organic-manure';
import { CountryEntity } from '@db/entity/country.entity';
import { ManureGroupEntity } from '@db/entity/manure-group.entity';

describe('ManureTypeController', () => {
  let controller: ManureTypeController;
  let entityManager: EntityManager;
  let manureTypeRepository: any;
  let manureType: ManureTypeEntity;
  let countryRepository: any;
  let manureGroupRepository: any;
  let country: CountryEntity;
  let manureGroup: ManureGroupEntity;

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
    manureTypeRepository = entityManager.getRepository(ManureTypeEntity);
    controller = module.get<ManureTypeController>(ManureTypeController);
    countryRepository = entityManager.getRepository(CountryEntity);
    manureGroupRepository = entityManager.getRepository(ManureGroupEntity);
    await truncateAllTables(entityManager);
    country = await countryRepository.save(countryData);
    manureGroup = await manureGroupRepository.save({
        Name: 'Livestock manure'
      });
      manureTypeData.CountryID = country.ID;
      manureTypeData.ManureGroupID = manureGroup.ID;
    manureType = await manureTypeRepository.save(manureTypeData);
  });

  describe('Get Manure Types', () => {
    it('should return manure types for manureGroupId and countryId', async () => {
      const manureGroupId = manureGroup.ID;
      const countryId = country.ID;
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
      const manureTypeId = manureType.ID;
      const result = await controller.getManureTypeByManureTypeId(manureTypeId);
      expect(result.ManureType).toBeDefined();
      expect(result.ManureType).toHaveProperty('ID');
    });
  });
});
