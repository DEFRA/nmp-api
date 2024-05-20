import { EntityManager, Repository, LessThanOrEqual } from 'typeorm';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import CropEntity from '@db/entity/crop.entity';
import FarmEntity from '@db/entity/farm.entity';
import FieldEntity from '@db/entity/field.entity';
import ManagementPeriodEntity from '@db/entity/management-period.entity';
import { RecommendationEntity } from '@db/entity/recommendation.entity';
import SoilAnalysisEntity from '@db/entity/soil-analysis.entity';
import { ApiDataResponseType } from '@shared/base.response';
import { BaseService } from '@src/base/base.service';
import { RB209ArableService } from '@src/vendors/rb209/arable/arable.service';
import { RB209RecommendationService } from '@src/vendors/rb209/recommendation/recommendation.service';
import { RecommendationCommentEntity } from '@db/entity/recommendation-comment.entity';
import { NutrientsMapper } from '@constants/nutrient-mapper';
import { CreateCropWithManagementPeriodsDto } from '@src/crop/dto/crop.dto';

@Injectable()
export class PlanService extends BaseService<
  RecommendationEntity,
  ApiDataResponseType<RecommendationEntity>
> {
  constructor(
    @InjectRepository(RecommendationEntity)
    protected readonly repository: Repository<RecommendationEntity>,
    protected readonly entityManager: EntityManager,
    @InjectRepository(ManagementPeriodEntity)
    protected readonly managementPeriodRepository: Repository<ManagementPeriodEntity>,
    @InjectRepository(CropEntity)
    protected readonly cropRepository: Repository<CropEntity>,
    @InjectRepository(FieldEntity)
    protected readonly fieldRepository: Repository<FieldEntity>,
    @InjectRepository(FarmEntity)
    protected readonly farmRepository: Repository<FarmEntity>,
    @InjectRepository(RecommendationCommentEntity)
    protected readonly recommendationCommentEntity: Repository<RecommendationCommentEntity>,
    @InjectRepository(SoilAnalysisEntity)
    protected readonly soilAnalysisRepository: Repository<SoilAnalysisEntity>,
    protected readonly rB209ArableService: RB209ArableService,
    protected readonly rB209RecommendationService: RB209RecommendationService,
  ) {
    super(repository, entityManager);
  }

  private async buildNutrientRecommendationReqBody(
    field: FieldEntity,
    farm: FarmEntity,
    soilAnalysis: SoilAnalysisEntity,
    crop: CropEntity,
  ) {
    const cropTypesList: any[] =
      await this.rB209ArableService.getData('/Arable/CropTypes');
    const cropType = cropTypesList.find(
      (cropType) => cropType.cropTypeId === crop.CropTypeID,
    );
    const previousCrop = await this.cropRepository.find({
      where: {
        Year: crop.Year - 1,
        Confirm: true,
      },
      take: 1,
    })[0];
    const nutrientRecommendationnReqBody = {
      field: {
        fieldType: 1,
        multipleCrops: false,
        arable: [
          {
            cropGroupId: cropType.cropGroupId,
            cropTypeId: crop.CropTypeID,
            cropInfo1Id: crop.CropInfo1,
            cropInfo2Id: crop.CropInfo2,
            sowingDate: crop.SowingDate,
            expectedYield: crop.Yield,
          },
        ],
        grassland: {},
        soil: {
          soilTypeId: field.SoilTypeID,
          kReleasingClay: field.SoilReleasingClay,
          nvzActionProgrammeId: field.NVZProgrammeID,
          psc: 0, //TODO:: need to find it
          soilAnalyses: [],
        },
        harvestYear: crop.Year,
        area: farm.TotalFarmArea,
        postcode: farm.Postcode,
        altitude: farm.AverageAltitude,
        rainfallAverage: farm.Rainfall,
        excessWinterRainfall: 0, //TODO:: need to find it
        organicMaterials: [],
        previousCropping: {},
        countryId: farm.EnglishRules ? 1 : 2,
      },
      nutrients: {
        nitrogen: true,
        phosphate: true,
        potash: true,
        magnesium: true,
        sodium: true,
        sulphur: true,
        lime: true,
      },
      totals: true,
      referenceValue: `${field.ID}-${crop.ID}-${crop.Year}`,
    };
    if (soilAnalysis) {
      nutrientRecommendationnReqBody.field.soil.soilAnalyses.push({
        soilAnalysisDate: soilAnalysis.Date,
        soilpH: soilAnalysis.PH,
        sulphurDeficient: soilAnalysis.SulphurDeficient,
        snsIndexId: soilAnalysis.SoilNitrogenSupplyIndex,
        pIndexId: soilAnalysis.PhosphorusIndex,
        kIndexId: soilAnalysis.PotassiumIndex,
        mgIndexId: soilAnalysis.MagnesiumIndex,
        snsMethodologyId: 4,
        pMethodologyId: 0,
        kMethodologyId: 4,
        mgMethodologyId: 4,
      });
      nutrientRecommendationnReqBody.referenceValue = `${field.ID}-${crop.ID}-${soilAnalysis.ID}-${crop.Year}`;
    }

    if (previousCrop) {
      const cropType = cropTypesList.find(
        (cropType) => cropType.cropTypeId === previousCrop.CropTypeID,
      );
      nutrientRecommendationnReqBody.field.previousCropping = {
        previousCropGroupId: cropType.cropGroupId,
        previousCropTypeId: previousCrop.CropTypeID,
      };
    }
    return nutrientRecommendationnReqBody;
  }

  async createNutrientsRecommendationForField(
    crops: CreateCropWithManagementPeriodsDto[],
  ) {
    return await this.entityManager.transaction(
      async (transactionalManager) => {
        const Recommendations = [];
        for (const cropData of crops) {
          const fieldId = cropData.Crop.FieldID;
          const savedCrop = await transactionalManager.save(
            this.cropRepository.create({
              ...cropData.Crop,
            }),
          );
          const ManagementPeriods: ManagementPeriodEntity[] = [];
          for (const managementPeriod of cropData.ManagementPeriods) {
            const savedManagementPeriod = await transactionalManager.save(
              this.managementPeriodRepository.create({
                ...managementPeriod,
                CropID: savedCrop.ID,
              }),
            );
            ManagementPeriods.push(savedManagementPeriod);
          }

          const field = await this.fieldRepository.findOneBy({
            ID: fieldId,
          });

          const farm = await this.farmRepository.findOneBy({
            ID: field.FarmID,
          });

          const latestSoilAnalysis = (
            await this.soilAnalysisRepository.find({
              where: {
                Year: LessThanOrEqual(savedCrop.Year),
              },
              order: { Date: 'DESC' },
              take: 1,
            })
          )[0];

          const nutrientRecommendationnReqBody =
            await this.buildNutrientRecommendationReqBody(
              field,
              farm,
              latestSoilAnalysis,
              savedCrop,
            );

          const nutrientRecommendationsData =
            await this.rB209RecommendationService.postData(
              'Recommendation/Recommendations',
              nutrientRecommendationnReqBody,
            );

          if (
            !nutrientRecommendationsData.recommendations ||
            !nutrientRecommendationsData.adviceNotes ||
            nutrientRecommendationsData.errors
          ) {
            throw new HttpException(
              JSON.stringify(nutrientRecommendationsData),
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }

          const cropNutrientsValue: any = {};
          nutrientRecommendationsData.recommendations.forEach(
            (recommendation) => {
              cropNutrientsValue[NutrientsMapper[recommendation.nutrientId]] =
                recommendation.cropNeedValue;
            },
          );

          const savedRecommendation = await transactionalManager.save(
            this.repository.create({
              CropN: cropNutrientsValue.N,
              CropP2O5: cropNutrientsValue.P2O5,
              CropK2O: cropNutrientsValue.K2O,
              CropMgO: cropNutrientsValue.MgO,
              CropSO3: cropNutrientsValue.SO3,
              CropNa2O: cropNutrientsValue.Na2O,
              PH: latestSoilAnalysis.PH?.toString(),
              SNSIndex: latestSoilAnalysis.SoilNitrogenSupplyIndex?.toString(),
              PIndex: latestSoilAnalysis.PhosphorusIndex?.toString(),
              KIndex: latestSoilAnalysis.PotassiumIndex?.toString(),
              MgIndex: latestSoilAnalysis.MagnesiumIndex?.toString(),
              ManagementPeriodID: ManagementPeriods[0].ID,
              Comments: `Refrence Value: ${nutrientRecommendationsData.referenceValue}\nVersion: ${nutrientRecommendationsData.versionNumber}`,
              CreatedByID: savedCrop.CreatedByID,
            }),
          );
          const RecommendationComments: RecommendationCommentEntity[] = [];
          for (const adviceNote of nutrientRecommendationsData.adviceNotes) {
            const savedRecommendationComment = await transactionalManager.save(
              this.recommendationCommentEntity.create({
                Nutrient: adviceNote.nutrientId,
                Comment: adviceNote.note,
                RecommendationID: savedRecommendation.ID,
              }),
            );
            RecommendationComments.push(savedRecommendationComment);
          }
          Recommendations.push({
            Recommendation: savedRecommendation,
            RecommendationComments,
          });
        }
        return {
          Recommendations,
        };
      },
    );
  }

  async getPlans(farmId: number, confirm: boolean) {
    try {
      const storedProcedure =
        'EXEC dbo.spCrops_GetPlans @farmId = @0, @confirm = @1';
      const farms = await this.executeQuery(storedProcedure, [farmId, confirm]);
      return farms;
    } catch (error) {
      console.error('Error while fetching join data:', error);
      throw error;
    }
  }

  private async mapCropTypeIdWithTheirNames(plans) {
    const unorderedMap = {};
    const cropTypesList =
      await this.rB209ArableService.getData('/Arable/CropTypes');
    for (const cropType of cropTypesList) {
      unorderedMap[cropType.cropTypeId] = cropType.cropType;
    }

    for (const plan of plans) {
      plan.CropTypeName = unorderedMap[plan.CropTypeID] || null;
    }
    return plans;
  }
  async getPlansByHarvestYear(farmId: number, harvestYear: number) {
    try {
      const storedProcedure =
        'EXEC dbo.spCrops_GetPlansByHarvestYear @farmId = @0, @harvestYear = @1';
      const plans = await this.executeQuery(storedProcedure, [
        farmId,
        harvestYear,
      ]);

      return await this.mapCropTypeIdWithTheirNames(plans);
    } catch (error) {
      console.error(
        'Error while fetching plans data join data by farmId and harvest year:',
        error,
      );
      throw error;
    }
  }
}
