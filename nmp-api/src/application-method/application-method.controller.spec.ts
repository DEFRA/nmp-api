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

describe('ApplicationMethodController', () => {
  let controller: ApplicationMethodController;
  let entityManager: EntityManager;
  let applicationMethodRepository: any;

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
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getApplicationMethods', () => {
    it('should return application methods', async () => {
      const sampleApplicationMethodData = applicationMethodRepository.create(
        applicationMethodData,
      );
      await applicationMethodRepository.save(sampleApplicationMethodData);

      const result = await controller.getApplicationMethods(1, 'B');
      expect(result.ApplicationMethods).toBeDefined();
    });
  });
});
