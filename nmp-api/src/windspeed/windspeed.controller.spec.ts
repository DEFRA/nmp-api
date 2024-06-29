import { Test, TestingModule } from '@nestjs/testing';
import { WindspeedController } from './windspeed.controller';
import { WindspeedService } from './windspeed.service';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EntityManager } from 'typeorm';
import { ormConfig } from '../../test/ormConfig';
import { truncateAllTables } from '../../test/utils';
import { WindspeedData } from '../../test/mocked-data/WindspeedData';
import { WindspeedEntity } from '@db/entity/wind-speed.entity';

describe('WindspeedController', () => {
  let controller: WindspeedController;
  let service: WindspeedService;
  let entityManager: EntityManager;
  let windspeedRepository: any;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(ormConfig),
        TypeOrmModule.forFeature([WindspeedEntity]),
      ],
      controllers: [WindspeedController],
      providers: [WindspeedService],
    }).compile();

    controller = module.get<WindspeedController>(WindspeedController);
    service = module.get<WindspeedService>(WindspeedService);
    entityManager = module.get<EntityManager>(EntityManager);
    windspeedRepository = entityManager.getRepository(WindspeedEntity);
    await truncateAllTables(entityManager);
  });

  afterEach(async () => {
    await truncateAllTables(entityManager);
  });

 describe('WindspeedController', () => {
   let controller: WindspeedController;
   let entityManager: EntityManager;
   let windspeedRepository: any;

   beforeAll(async () => {
     const module: TestingModule = await Test.createTestingModule({
       imports: [
         TypeOrmModule.forRoot(ormConfig),
         TypeOrmModule.forFeature([WindspeedEntity]),
       ],
       controllers: [WindspeedController],
       providers: [WindspeedService],
     }).compile();

     controller = module.get<WindspeedController>(WindspeedController);
     entityManager = module.get<EntityManager>(EntityManager);
     windspeedRepository = entityManager.getRepository(WindspeedEntity);
     await truncateAllTables(entityManager);
   });

   afterEach(async () => {
     await truncateAllTables(entityManager);
   });

   describe('findFirstRow', () => {
     it('should return the first row of windspeeds', async () => {
       // Insert a sample windspeed data using mocked data
       const sampleWindspeedData =
         await windspeedRepository.save(WindspeedData);

       // Call the controller method
       const result = await controller.findFirstRow();

       // Assert the result
       expect(result).toBeDefined();
       expect(result.ID).toBe(WindspeedData.ID);
       expect(result.Name).toBe(WindspeedData.Name);
       expect(result.FromScale).toBe(WindspeedData.FromScale);
       expect(result.ToScale).toBe(WindspeedData.ToScale);
     });
   });

   afterAll(async () => {
     await entityManager.connection.close();
   });
 });


  // Add more test cases as needed

//   afterAll(async () => {
//     await module.close(); // Close the module after all tests
//   });
});
