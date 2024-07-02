import { Test, TestingModule } from '@nestjs/testing';
import { IncorporationDelaysService } from './incorporation-delay.service';
import { IncorporationDelaysController } from './incorporation-delay.controller';
import { HttpStatus } from '@nestjs/common';
import { IncorporationDelayEntity } from '@db/entity/incorporation-delay.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ormConfig } from '../../test/ormConfig';
import { EntityManager } from 'typeorm';
import { truncateAllTables } from '../../test/utils';
import {
  incorporationDelayData,
  incorporationMethodData,
} from '../../test/mocked-data/organic-manure';
import { IncorporationMethodEntity } from '@db/entity/incorporation-method.entity';
import { IncorpMethodsIncorpDelayEntity } from '@db/entity/incorp-method-incorp-delay.entity';
import { IncorporationMethodService } from '@src/incorporation-method/incorporation-method.service';

describe('IncorporationDelaysController', () => {
  let controller: IncorporationDelaysController;
  let entityManager: EntityManager;
  let incorporationDelay: IncorporationDelayEntity;
  let incorporationDelayRepository: any;
  let incorporationMethod: IncorporationMethodEntity;
  let incorporationMethodRepository: any;
  let incorpMethodsIncorpDelayRepository: any;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(ormConfig),
        TypeOrmModule.forFeature([
          IncorporationDelayEntity,
          IncorporationMethodEntity,
          IncorpMethodsIncorpDelayEntity,
        ]),
        CacheModule.register(),
      ],
      controllers: [IncorporationDelaysController],
      providers: [IncorporationDelaysService],
      exports: [TypeOrmModule],
    }).compile();

    controller = module.get<IncorporationDelaysController>(
      IncorporationDelaysController,
    );
    entityManager = module.get<EntityManager>(EntityManager);
    incorporationDelayRepository = entityManager.getRepository(
      IncorporationDelayEntity,
    );
    incorporationMethodRepository = entityManager.getRepository(
      IncorporationMethodEntity,
    );
    incorpMethodsIncorpDelayRepository = entityManager.getRepository(
      IncorpMethodsIncorpDelayEntity,
    );
    await truncateAllTables(entityManager);
    const sampleIncorporationDelayData = incorporationDelayRepository.create(
      incorporationDelayData,
    );
    incorporationDelay = await incorporationDelayRepository.save(
      sampleIncorporationDelayData,
    );

    const sampleIncorporationMethodData = incorporationMethodRepository.create(
      incorporationMethodData,
    );
    incorporationMethod = await incorporationMethodRepository.save(
      sampleIncorporationMethodData,
    );

    const sampleIncorpMethodsIncorpDelay =
      incorpMethodsIncorpDelayRepository.create({
        IncorporationMethodID: incorporationMethod.ID,
        IncorporationDelayID: incorporationDelay.ID,
      });
    await incorpMethodsIncorpDelayRepository.save(
      sampleIncorpMethodsIncorpDelay,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getIncorporationDelays', () => {
    it('should return a list of incorporation delays for valid methodId and applicableFor', async () => {
      const result = await controller.getIncorporationDelays(
        incorporationMethod.ID,
        'A',
      );
      expect(result.IncorporationDelays).toBeDefined();
      expect(result.IncorporationDelays.length).toBeGreaterThan(0);
    });

    it('should return an empty list for invalid methodId and applicableFor', async () => {
      const result = await controller.getIncorporationDelays(0, 'L');
      expect(result).toEqual({ IncorporationDelays: [] });
    });
  });

  describe('getIncorporationDelayById', () => {
    it('should return the incorporation delay for a valid ID', async () => {
      const incorporationDelayId = incorporationDelay.ID;

      const result =
        await controller.getIncorporationDelayById(incorporationDelayId);

      expect(result.IncorporationDelay).toBeDefined();
      expect(result.IncorporationDelay).toHaveProperty('ID');
    });

    it('should throw NotFoundException for an invalid ID', async () => {
      const invalidDelayId = 0;

      try {
        await controller.getIncorporationDelayById(invalidDelayId);
      } catch (error) {
        expect(error.status).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });
});
