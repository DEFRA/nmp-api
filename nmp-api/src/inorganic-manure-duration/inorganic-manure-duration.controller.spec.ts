import { Test, TestingModule } from '@nestjs/testing';
import { InorganicManureDurationController } from './inorganic-manure-duration.controller';
import { InOrganicManureDurationEntity } from '@db/entity/inorganic-manure-duration.entity';
import { InorganicManureDurationService } from './inorganic-manure-duration.service';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ormConfig } from '../../test/ormConfig';
import { inorganicManureDurationReqBody } from '../../test/mocked-data/inorganicManureDuration';
import { truncateAllTables } from '../../test/utils';
import { EntityManager } from 'typeorm';

describe('InorganicManureDurationController', () => {
  let controller: InorganicManureDurationController;
  let entityManager: any;
  let inorganicManureDurationRepository: any;
  let inorganicManureDuration: InOrganicManureDurationEntity;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CacheModule.register(),
        TypeOrmModule.forRoot(ormConfig),
        TypeOrmModule.forFeature([InOrganicManureDurationEntity]),
      ],
      controllers: [InorganicManureDurationController],
      providers: [InorganicManureDurationService],
      exports: [TypeOrmModule],
    }).compile();

    controller = module.get<InorganicManureDurationController>(
      InorganicManureDurationController,
    );

    entityManager = module.get<EntityManager>(EntityManager);
    inorganicManureDurationRepository = entityManager.getRepository(
      InOrganicManureDurationEntity,
    );

    await truncateAllTables(entityManager);

    const sampleInorganicManureDurationData =
      inorganicManureDurationRepository.create(inorganicManureDurationReqBody);
    inorganicManureDuration = await inorganicManureDurationRepository.save(
      sampleInorganicManureDurationData,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Get list of Inorganic Manure Durations', () => {
    it('should return an array of Inorganic Manure Durations', async () => {
      const result = await controller.getInorganicManureDurations();
      expect(Array(result.InorganicManureDurations).length).toBeGreaterThan(0);
    });
  });

  describe('Get Inorganic Manure Duration By Id', () => {
    it('should return Inorganic Manure Duration for given Id', async () => {
      const id = inorganicManureDuration.ID;

      const result = await controller.getInorganicManureDurationById(id);
      expect(result.InorganicManureDuration).toBeDefined();
      expect(result.InorganicManureDuration).toHaveProperty('ID');
    });
  });
});
