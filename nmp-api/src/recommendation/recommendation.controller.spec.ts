import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationService } from './recommendation.service';
import { RecommendationController } from './recommendation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ormConfig } from '../../test/ormConfig';
import { RecommendationEntity } from '@db/entity/recommendation.entity';
import { RecommendationCommentEntity } from '@db/entity/recommendation-comment.entity';
import { EntityManager } from 'typeorm';
import { truncateAllTables } from '../../test/utils';
import FarmEntity from '@db/entity/farm.entity';
import FieldEntity from '@db/entity/field.entity';
import OrganisationEntity from '@db/entity/organisation.entity';
import {
  createCropReqBody,
  createFarmReqBody2,
  createFieldReqBody,
  createManagementPeriodReqBody,
  createOrganisationReqBody,
  createRecommendationCommentReqBody,
  createRecommendationReqBody,
  userData,
} from '../../test/mocked-data';
import CropEntity from '@db/entity/crop.entity';
import ManagementPeriodEntity from '@db/entity/management-period.entity';
import UserEntity from '@db/entity/user.entity';

describe('RecommendationsController', () => {
  let controller: RecommendationController;
  let entityManager: EntityManager;
  let farmRepository: any;
  let fieldRepository: any;
  let organisationRepository: any;
  let cropRepository: any;
  let managementPeriodRepository: any;
  let recommendationRepository: any;
  let recommendationCommentRepository: any;
  let userRepository: any;
  let user: UserEntity;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(ormConfig),
        TypeOrmModule.forFeature([
          RecommendationEntity,
          RecommendationCommentEntity,
        ]),
      ],
      controllers: [RecommendationController],
      providers: [RecommendationService],
      exports: [TypeOrmModule],
    }).compile();

    controller = module.get<RecommendationController>(RecommendationController);
    entityManager = module.get<EntityManager>(EntityManager);
    farmRepository = entityManager.getRepository(FarmEntity);
    fieldRepository = entityManager.getRepository(FieldEntity);
    organisationRepository = entityManager.getRepository(OrganisationEntity);
    cropRepository = entityManager.getRepository(CropEntity);
    managementPeriodRepository = entityManager.getRepository(
      ManagementPeriodEntity,
    );
    recommendationRepository =
      entityManager.getRepository(RecommendationEntity);
    recommendationCommentRepository = entityManager.getRepository(
      RecommendationCommentEntity,
    );
    userRepository = entityManager.getRepository(UserEntity);
    await truncateAllTables(entityManager);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Get Nutrients Recommendations For Field By FieldId And Harvest Year', () => {
    it('should return recommendations for field by field ID and harvest year', async () => {
      await truncateAllTables(entityManager);
      const organisation = await organisationRepository.save(
        createOrganisationReqBody,
      );
      user = await userRepository.save(userData);
      createFarmReqBody2.OrganisationID = organisation.ID;
      createFarmReqBody2.CreatedByID = user.ID;
      const createdFarm = await farmRepository.save(createFarmReqBody2);
      createFieldReqBody.FarmID = createdFarm.ID;
      createFieldReqBody.CreatedByID = user.ID;
      const createdField = await fieldRepository.save(createFieldReqBody);
      createCropReqBody.FieldID = createdField.ID;
      createCropReqBody.CreatedByID = user.ID;
      const createdCrop = await cropRepository.save(createCropReqBody);
      createManagementPeriodReqBody.CropID = createdCrop.ID;
      createManagementPeriodReqBody.CreatedByID = user.ID;
      const managementPeriod = await managementPeriodRepository.save(
        createManagementPeriodReqBody,
      );
      createRecommendationReqBody.ManagementPeriodID = managementPeriod.ID;
      const recommendation = await recommendationRepository.save(
        createRecommendationReqBody,
      );
      for (const recommendationComment of createRecommendationCommentReqBody) {
        recommendationComment.RecommendationID = recommendation.ID;
        await recommendationCommentRepository.save(recommendationComment);
      }
      const fieldId = createdField.ID;
      const harvestYear = 2023;
      const result: any =
        await controller.getNutrientsRecommendationsForFieldByFieldIdAndHarvestYear(
          fieldId,
          harvestYear,
        );
      expect(result.Recommendations[0].Crop).toBeTruthy();
      expect(result.Recommendations[0].Recommendations.length).toBeGreaterThan(
        0,
      );
      expect(
        result.Recommendations[0].Recommendations[0].RecommendationComments
          .length,
      ).toBeGreaterThan(0);
      expect(
        result.Recommendations[0].Recommendations[0].Recommendation,
      ).toBeTruthy();
    });
  });
});
