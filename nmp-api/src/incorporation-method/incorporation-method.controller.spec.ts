import { Test, TestingModule } from '@nestjs/testing';
import { IncorporationMethodController } from './incorporation-method.controller';
import { IncorporationMethodService } from './incorporation-method.service';
import { IncorporationMethodEntity } from '@db/entity/incorporation-method.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ormConfig } from '../../test/ormConfig';
import { ApplicationMethodsIncorpMethodEntity } from '@db/entity/application-method-incorp-method.entity';
import { EntityManager } from 'typeorm';
import { ApplicationMethodEntity } from '@db/entity/application-method.entity';
import { applicationMethodData } from '../../test/mocked-data/applicationMethod';
import { truncateAllTables } from '../../test/utils';
import { incorporationMethodData } from '../../test/mocked-data/organic-manure';
import { ApplicationMethodService } from '@src/application-method/application-method.service';
import { HttpStatus } from '@nestjs/common';

describe('IncorporationMethodController', () => {
  let controller: IncorporationMethodController;
  let entityManager: EntityManager;
  let incorporationMethod: IncorporationMethodEntity;
  let incorporationMethodRepository: any;
  let applicationMethod: ApplicationMethodEntity;
  let applicationMethodRepository: any;
  let appMethodIncorpMethodRepository: any;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(ormConfig),
        TypeOrmModule.forFeature([
          IncorporationMethodEntity,
          ApplicationMethodEntity,
          ApplicationMethodsIncorpMethodEntity,
        ]),
        CacheModule.register(),
      ],
      controllers: [IncorporationMethodController],
      providers: [IncorporationMethodService, ApplicationMethodService],
      exports: [TypeOrmModule],
    }).compile();

    controller = module.get<IncorporationMethodController>(
      IncorporationMethodController,
    );
    entityManager = module.get<EntityManager>(EntityManager);
    applicationMethodRepository = entityManager.getRepository(
      ApplicationMethodEntity,
    );
    incorporationMethodRepository = entityManager.getRepository(
      IncorporationMethodEntity,
    );
    appMethodIncorpMethodRepository = entityManager.getRepository(
      ApplicationMethodsIncorpMethodEntity,
    );
    await truncateAllTables(entityManager);

    const sampleApplicationMethodData = applicationMethodRepository.create(
      applicationMethodData,
    );
    applicationMethod = await applicationMethodRepository.save(
      sampleApplicationMethodData,
    );

    const sampleIncorporationMethodData = incorporationMethodRepository.create(
      incorporationMethodData,
    );
    incorporationMethod = await incorporationMethodRepository.save(
      sampleIncorporationMethodData,
    );

    const sampleAppMethodIncorpMethodData =
      appMethodIncorpMethodRepository.create({
        ApplicationMethodID: applicationMethod.ID,
        IncorporationMethodID: incorporationMethod.ID,
      });
    await appMethodIncorpMethodRepository.save(sampleAppMethodIncorpMethodData);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getIncorporationMethods', () => {
    it('should return a list of incorporation methods for valid parameters', async () => {
      const result = await controller.getIncorporationMethods(
        1,
        'B',
        applicationMethod.ID,
      );
      expect(result.IncorporationMethods).toBeDefined;
      expect(result.IncorporationMethods.length).toBeGreaterThan(0);
    });

    it('should return an empty list for invalid parameters', async () => {
      const result = await controller.getIncorporationMethods(1, 'C', 0);
      expect(result).toEqual({ IncorporationMethods: [] });
    });
  });

  describe('getIncorporationMethodsById', () => {
    it('should return the incorporation methods for a valid ID', async () => {
      const incorporationDelayId = incorporationMethod.ID;

      const result =
        await controller.getIncorporationMethodById(incorporationDelayId);

      expect(result.IncorporationMethod).toBeDefined();
      expect(result.IncorporationMethod).toHaveProperty('ID');
    });

    it('should throw NotFoundException for an invalid ID', async () => {
      const invalidMethodId = 0;

      try {
        await controller.getIncorporationMethodById(invalidMethodId);
      } catch (error) {
        expect(error.status).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });
});
