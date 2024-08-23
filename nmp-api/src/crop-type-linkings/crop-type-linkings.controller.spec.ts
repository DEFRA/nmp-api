import { Test, TestingModule } from '@nestjs/testing';
import { CropTypeLinkingsController } from './crop-type-linkings.controller';
import { CropTypeLinkingEntity } from '@db/entity/crop-type-linking.entity';
import { CropTypeLinkingsService } from './crop-type-linkings.service';
import { cropTypeLinkingReqBody } from '../../test/mocked-data/cropTypeLinking';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ormConfig } from '../../test/ormConfig';
import { truncateAllTables } from '../../test/utils';
import { EntityManager } from 'typeorm';
import { MannerCropTypeEntity } from '@db/entity/manner-crop-type.entity';
import { createMannerCropTypeReqBody } from '../../test/mocked-data/mannerCropType';

describe('CropTypeLinkingsController', () => {
  let controller: CropTypeLinkingsController;
  let entityManager: any;
  let cropTypeLinkingRepository: any;
  let cropTypeLinking: CropTypeLinkingEntity;
  let mannerCropTypeRepository: any;
  let mannerCropType: MannerCropTypeEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CacheModule.register(),
        TypeOrmModule.forRoot(ormConfig),
        TypeOrmModule.forFeature([CropTypeLinkingEntity]),
      ],
      controllers: [CropTypeLinkingsController],
      providers: [CropTypeLinkingsService],
      exports: [TypeOrmModule],
    }).compile();

    controller = module.get<CropTypeLinkingsController>(
      CropTypeLinkingsController,
    );
    entityManager = module.get<EntityManager>(EntityManager);
    mannerCropTypeRepository =
      entityManager.getRepository(MannerCropTypeEntity);
    cropTypeLinkingRepository = entityManager.getRepository(
      CropTypeLinkingEntity,
    );
    await truncateAllTables(entityManager);
    const sampleMannerCropTypeData = mannerCropTypeRepository.create(
      createMannerCropTypeReqBody,
    );
    mannerCropType = await mannerCropTypeRepository.save(
      sampleMannerCropTypeData,
    );
    cropTypeLinkingReqBody.MannerCropTypeID = mannerCropType.ID;
    const sampleCropTypeLinkingData = cropTypeLinkingRepository.create(
      cropTypeLinkingReqBody,
    );
    cropTypeLinking = await cropTypeLinkingRepository.save(
      sampleCropTypeLinkingData,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Get Crop Type Linking By CropType Id', () => {
    it('should return Crop Type Linking for given CropTypeId', async () => {
      const id = cropTypeLinking.CropTypeID;

      const result = await controller.getCropTypeLinkingByCropTypeID(id);
      expect(result.CropTypeLinking).toBeDefined();
      expect(result.CropTypeLinking).toHaveProperty('CropTypeID');
    });
  });
});
