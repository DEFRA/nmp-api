// rain-type.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { RainTypeController } from './rain-type.controller';
import { RainTypeService } from './rain-type.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { ormConfig } from '../../test/ormConfig';
import { truncateAllTables } from '../../test/utils';
import { RainTypeEntity } from '@db/entity/rain-type.entity';
import { RainTypeData } from '../../test/mocked-data/RainTypeData';

describe('RainTypeController', () => {
  let controller: RainTypeController;
  let service: RainTypeService;
  let entityManager: EntityManager;
  let rainTypeRepository: any;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(ormConfig),
        TypeOrmModule.forFeature([RainTypeEntity]),
      ],
      controllers: [RainTypeController],
      providers: [RainTypeService],
    }).compile();

    controller = module.get<RainTypeController>(RainTypeController);
    service = module.get<RainTypeService>(RainTypeService);
    entityManager = module.get<EntityManager>(EntityManager);
    rainTypeRepository = entityManager.getRepository(RainTypeEntity);
    await truncateAllTables(entityManager);
  });

  afterEach(async () => {
    await truncateAllTables(entityManager);
  });

  describe('findFirstRow', () => {
    it('should return the first row of rain types', async () => {
      // Insert sample rain type data using mocked data
      await rainTypeRepository.save(RainTypeData[0]);

      // Call the controller method
      const result = await controller.findFirstRow();

      // Assert the result
      expect(result).toBeDefined();
      expect(result.ID).toBe(RainTypeData[0].ID);
      expect(result.Name).toBe(RainTypeData[0].Name);
      expect(result.RainInMM).toBe(RainTypeData[0].RainInMM);
    });
  });

  describe('findAll', () => {
    it('should return all rows of rain types', async () => {
      // Insert sample rain type data using mocked data
      await rainTypeRepository.save(RainTypeData);

      // Call the controller method
      const result = await controller.findAll();
      const records = result; // Extract the records

      // Assert the result
      expect(records).toBeDefined();
      expect(records.RainTypes.length).toBe(RainTypeData.length);
      records.RainTypes.forEach((rainType, index) => {
        expect(rainType.ID).toBe(RainTypeData[index].ID);
        expect(rainType.Name).toBe(RainTypeData[index].Name);
        expect(rainType.RainInMM).toBe(RainTypeData[index].RainInMM);
      });
    });
  });

  afterAll(async () => {
    await entityManager.connection.destroy();
  });
});
