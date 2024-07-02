import { Test, TestingModule } from '@nestjs/testing';
import { MoistureTypeEntity } from '@db/entity/moisture-type.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ormConfig } from '../../test/ormConfig';
import { MoistureTypeController } from './moisture-type.controller';
import { MoistureTypeService } from './moisture-type.service';
import { CacheModule } from '@nestjs/cache-manager';
import { truncateAllTables } from '../../test/utils';
import {
  dryMoistureTypeData,
  moistMoistureTypeData,
} from '../../test/mocked-data/moistureType';
import { EntityManager } from 'typeorm';

describe('MoistureTypeController', () => {
  let controller: MoistureTypeController;
  let entityManager: any;
  let moistureTypeRepository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CacheModule.register(),
        TypeOrmModule.forRoot(ormConfig),
        TypeOrmModule.forFeature([MoistureTypeEntity]),
      ],
      controllers: [MoistureTypeController],
      providers: [MoistureTypeService],
      exports: [TypeOrmModule],
    }).compile();

    controller = module.get<MoistureTypeController>(MoistureTypeController);
    entityManager = module.get<EntityManager>(EntityManager);
    moistureTypeRepository = entityManager.getRepository(MoistureTypeEntity);
    await truncateAllTables(entityManager);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Get all Moisture Types', () => {
    it('should return an array of moisture types', async () => {
      const sampleMoistureTypeData = moistureTypeRepository.create(
        dryMoistureTypeData,
        moistMoistureTypeData,
      );
      await moistureTypeRepository.save(sampleMoistureTypeData);

      const result = await controller.getSoilMoistureTypes();
      expect(Array(result.MoistureTypes).length).toBeGreaterThan(0);
    });
  });

  describe('Get default Moisture Type based on Application Date', () => {
    it('should return dry moisture type', async () => {
      const sampleMoistureTypeData =
        moistureTypeRepository.create(dryMoistureTypeData);
      await moistureTypeRepository.save(sampleMoistureTypeData);
      const date = '2024-05-24 16:14:39.887';
      const result = await controller.getDefaultSoilMoistureType(date);
      expect(result.MoistureType).toBeDefined();
    });

    it('should return moist moisture type', async () => {
      const sampleMoistureTypeData = moistureTypeRepository.create(
        moistMoistureTypeData,
      );
      await moistureTypeRepository.save(sampleMoistureTypeData);

      const date = '2024-08-24 16:14:39.887';
      const result = await controller.getDefaultSoilMoistureType(date);
      expect(result.MoistureType).toBeDefined();
    });
  });
});
