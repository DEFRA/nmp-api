import { Test, TestingModule } from '@nestjs/testing';
import { MannerCropTypesController } from './manner-crop-types.controller';
import { MannerCropTypeEntity } from '@db/entity/manner-crop-type.entity';
import { EntityManager } from 'typeorm';
import { truncateAllTables } from '../../test/utils';
import { createCropReqBody } from '../../test/mocked-data';
import { createMannerCropTypeReqBody } from '../../test/mocked-data/mannerCropType';
import { CropTypeLinkingEntity } from '@db/entity/crop-type-linking.entity';
import { MannerCropTypesService } from './manner-crop-types.service';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ormConfig } from '../../test/ormConfig';

describe('MannerCropTypesController', () => {
  let controller: MannerCropTypesController;
  let entityManager: EntityManager;
  let mannerCropTypeRepository: any;
  let cropTypeLinkingRepository: any;
  let mannerCropType: MannerCropTypeEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MannerCropTypesController],
      imports: [
        TypeOrmModule.forRoot(ormConfig),
        TypeOrmModule.forFeature([MannerCropTypeEntity, CropTypeLinkingEntity]),
        CacheModule.register(),
      ],
      providers: [MannerCropTypesService],
      exports: [TypeOrmModule],
    }).compile();

    controller = module.get<MannerCropTypesController>(
      MannerCropTypesController,
    );
    entityManager = module.get<EntityManager>(EntityManager);
    mannerCropTypeRepository =
      entityManager.getRepository(MannerCropTypeEntity);
    cropTypeLinkingRepository = entityManager.getRepository(
      CropTypeLinkingEntity,
    );
    await truncateAllTables(entityManager);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Get MannerCropTypeId and cropUptakeFactor by CropTypeId', () => {
    it('should return a MannerCropTypeId and cropUptakeFactor by CropTypeId', async () => {
      const sampleMannerCropTypeData = mannerCropTypeRepository.create(
        createMannerCropTypeReqBody,
      );
      mannerCropType = await mannerCropTypeRepository.save(
        sampleMannerCropTypeData,
      );

      const sampleCropTypeLinkingData = cropTypeLinkingRepository.create({
        CropTypeID: createCropReqBody.CropTypeID,
        MannerCropTypeID: mannerCropType.ID,
        DefaultYield: null,
      });

      await cropTypeLinkingRepository.save(sampleCropTypeLinkingData);

      const cropTypeId = createCropReqBody.CropTypeID;
      const result =
        await controller.getMannerCropTypeInfoByCropTypeID(cropTypeId);

      expect(result.MannerCropTypes).toBeDefined();
      expect(Array(result.MannerCropTypes).length).toBeGreaterThanOrEqual(1);
    });
  });
});
