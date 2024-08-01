import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationMethodController } from './application-method.controller';
import { ApplicationMethodService } from './application-method.service';
import { ApplicationMethodEntity } from '@db/entity/application-method.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ormConfig } from '../../test/ormConfig';
import { EntityManager } from 'typeorm';
import { truncateAllTables } from '../../test/utils';
import { applicationMethodData } from '../../test/mocked-data/applicationMethod';
import { HttpStatus } from '@nestjs/common';

describe('ApplicationMethodController', () => {
  let controller: ApplicationMethodController;
  let entityManager: EntityManager;
  let applicationMethodRepository: any;
  let applicationMethod: ApplicationMethodEntity;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(ormConfig),
        TypeOrmModule.forFeature([ApplicationMethodEntity]),
        CacheModule.register(),
      ],
      controllers: [ApplicationMethodController],
      providers: [ApplicationMethodService],
      exports: [TypeOrmModule],
    }).compile();

    controller = module.get<ApplicationMethodController>(
      ApplicationMethodController,
    );
    entityManager = module.get<EntityManager>(EntityManager);
    applicationMethodRepository = entityManager.getRepository(
      ApplicationMethodEntity,
    );
    await truncateAllTables(entityManager);
    const sampleApplicationMethodData = applicationMethodRepository.create(
      applicationMethodData,
    );
    applicationMethod = applicationMethodRepository.save(
      sampleApplicationMethodData,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getApplicationMethods', () => {
    it('should return application methods', async () => {
      const result = await controller.getApplicationMethods(1, 'B');
      expect(result.ApplicationMethods).toBeDefined();
    });
  });

  describe('getApplicationMethods by Id', () => {
    it('should return application methods based on Id', async () => {
      const applicationMethodId = applicationMethod.ID;

      const result =
        await controller.getApplicationMethodById(applicationMethodId);

      expect(result.ApplicationMethod).toBeDefined();
      expect(result.ApplicationMethod).toHaveProperty('ID');
    });

    it('should throw NotFoundException for an invalid ID', async () => {
      const invalidDelayId = 0;

      try {
        await controller.getApplicationMethodById(invalidDelayId);
      } catch (error) {
        expect(error.status).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });
});
