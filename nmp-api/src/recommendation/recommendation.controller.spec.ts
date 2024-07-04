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
  applicationMethodData,
  countryData,
  createCropReqBody,
  createFarmReqBody2,
  createFieldReqBody,
  createManagementPeriodReqBody,
  createOrganisationReqBody,
  createRecommendationCommentReqBody,
  createRecommendationReqBody,
  incorporationDelayData,
  incorporationMethodData,
  manureTypeData,
  organicManureReqBody2,
  userData,
} from '../../test/mocked-data';
import CropEntity from '@db/entity/crop.entity';
import ManagementPeriodEntity from '@db/entity/management-period.entity';
import UserEntity from '@db/entity/user.entity';
import { OrganicManureEntity } from '@db/entity/organic-manure.entity';
import { ManureTypeEntity } from '@db/entity/manure-type.entity';
import { ApplicationMethodEntity } from '@db/entity/application-method.entity';
import { IncorporationMethodEntity } from '@db/entity/incorporation-method.entity';
import { IncorporationDelayEntity } from '@db/entity/incorporation-delay.entity';
import { CountryEntity } from '@db/entity/country.entity';
import { ManureGroupEntity } from '@db/entity/manure-group.entity';

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
  let organicManureRepository: any;
  let manureTypeRepository: any;
  let applicationMethodRepository: any;
  let incorporationMethodRepository: any;
  let incorporationDelayRepository: any;
  let countryRepository: any;
  let manureGroupRepository: any;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(ormConfig),
        TypeOrmModule.forFeature([
          RecommendationEntity,
          RecommendationCommentEntity,
          OrganicManureEntity,
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
    organicManureRepository = entityManager.getRepository(OrganicManureEntity);
    manureTypeRepository = entityManager.getRepository(ManureTypeEntity);
    applicationMethodRepository = entityManager.getRepository(
      ApplicationMethodEntity,
    );
    incorporationMethodRepository = entityManager.getRepository(
      IncorporationMethodEntity,
    );
    incorporationDelayRepository = entityManager.getRepository(
      IncorporationDelayEntity,
    );
    countryRepository = entityManager.getRepository(CountryEntity);
    manureGroupRepository = entityManager.getRepository(ManureGroupEntity);
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
      const country = await countryRepository.save(countryData);
      const manureGroup = await manureGroupRepository.save({
        Name: 'Livestock manure',
      });
      manureTypeData.CountryID = country.ID;
      manureTypeData.ManureGroupID = manureGroup.ID;
      const manureType = await manureTypeRepository.save(manureTypeData);
      const applicationMethod = await applicationMethodRepository.save(
        applicationMethodData,
      );
      const incorporationMethod = await incorporationMethodRepository.save(
        incorporationMethodData,
      );
      const incorporationDelay = await incorporationDelayRepository.save(
        incorporationDelayData,
      );
      organicManureReqBody2.ManagementPeriodID = managementPeriod.ID;
      organicManureReqBody2.ManureTypeID = manureType.ID;
      organicManureReqBody2.ApplicationMethodID = applicationMethod.ID;
      organicManureReqBody2.IncorporationMethodID = incorporationMethod.ID;
      organicManureReqBody2.IncorporationDelayID = incorporationDelay.ID;
      await organicManureRepository.save(organicManureReqBody2);
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
      expect(
        result.Recommendations[0].Recommendations[0].OrganicManures.length,
      ).toBeGreaterThan(0);
    });
  });
});
