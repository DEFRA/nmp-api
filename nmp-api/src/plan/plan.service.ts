import { EntityManager, Repository, LessThanOrEqual, Between } from 'typeorm';
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
import SnsAnalysesEntity from '@db/entity/sns-analysis.entity';

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
    @InjectRepository(SnsAnalysesEntity)
    protected readonly snsAnalysisRepository: Repository<SnsAnalysesEntity>,
  ) {
    super(repository, entityManager);
  }

  private async buildNutrientRecommendationReqBody(
    field: FieldEntity,
    farm: FarmEntity,
    soilAnalysis: SoilAnalysisEntity[],
    snsAnalysesData: SnsAnalysesEntity,
    crop: CropEntity,
  ) {
    const cropTypesList: any[] =
      await this.rB209ArableService.getData('/Arable/CropTypes');
    const cropType = cropTypesList.find(
      (cropType) => cropType.cropTypeId === crop.CropTypeID,
    );

    if (!cropType || cropType.cropGroupId === null) {
      throw new HttpException(
        `Invalid CropTypeId for crop having field name ${field.Name}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const previousCrop = await this.cropRepository.find({
      where: {
        FieldID: field.ID,
        Year: crop.Year - 1,
        Confirm: true,
      },
      take: 1,
    })[0];
    const nutrientRecommendationnReqBody = {
      field: {
        fieldType: crop.FieldType,
        multipleCrops: true,
        arable: [
          {
            cropOrder: crop.CropOrder,
            cropGroupId: cropType.cropGroupId,
            cropTypeId: crop.CropTypeID,
            cropInfo1Id: crop.CropInfo1,
            cropInfo2Id: crop.CropInfo2,
            sowingDate: crop.SowingDate,
            expectedYield: crop.Yield,
          },
        ],
        grassland: {
          cropOrder: null,
          grassGrowthClassId: null,
          yieldTypeId: null,
          sequenceId: null,
          grasslandSequence: [
            {
              position: null,
              cropMaterialId: null,
              yield: null,
            },
          ],
          establishedDate: null,
          seasonId: null,
          siteClassId: null,
        },
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
        mannerManures: false,
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
      soilAnalysis?.forEach((soilAnalysis) => {
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
      });
    }

    // Add SnsAnalyses data
    if (snsAnalysesData) {
      nutrientRecommendationnReqBody.field.soil.soilAnalyses.push({
        soilAnalysisDate: snsAnalysesData.SampleDate, // Using snsAnalysesData.SampleDate
        snsIndexId: snsAnalysesData.SoilNitrogenSupplyIndex, // Using snsAnalysesData.SoilNitrogenSupplyIndex
        snsMethodologyId: 4,
        pMethodologyId: 0,
        kMethodologyId: 4,
        mgMethodologyId: 4,
      });
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
    nutrientRecommendationnReqBody.referenceValue = `${field.ID}-${crop.ID}-${crop.Year}`;

    return nutrientRecommendationnReqBody;
  }

  private async handleFieldValidation(fieldId: number) {
    const errors: string[] = [];

    const field = await this.fieldRepository.findOneBy({
      ID: fieldId,
    });

    if (!field) {
      errors.push(`Please add field data for fieldId ${fieldId}`);
    }

    if (field.SoilTypeID === null) {
      errors.push(`SoilTypeID is required in field ${field.Name}`);
    }
    return { field, errors };
  }

  private async handleFarmValidation(farmId: number) {
    const errors: string[] = [];

    const farm = await this.farmRepository.findOneBy({
      ID: farmId,
    });

    if (!farm) {
      errors.push(`Please add farm data data for farmId ${farmId}`);
    }

    const farmRequiredKeys = [
      'TotalFarmArea',
      'Postcode',
      'Rainfall',
      'EnglishRules',
    ];
    farmRequiredKeys.forEach((key) => {
      if (farm[key] === null) {
        errors.push(`${key} is required in farm ${farm.Name}`);
      }
    });
    return { farm, errors };
  }

  async handleSoilAnalysisValidation(
    fieldId: number,
    fieldName: string,
    year: number,
  ) {
    const errors: string[] = [];
    const fiveYearsAgo = year - 4;

    // Fetch all soil analyses for the last 5 years
    const soilAnalysisRecords = await this.soilAnalysisRepository.find({
      where: {
        FieldID: fieldId,
        Year: Between(fiveYearsAgo, year), // Fetch records within 5 years
      },
      order: { Date: 'DESC' }, // Order by date, most recent first
    });

    const soilRequiredKeys = [
      'Date',
      'PH',
      'SulphurDeficient',
      'SoilNitrogenSupplyIndex',
      'PhosphorusIndex',
      'PotassiumIndex',
      'MagnesiumIndex',
    ];

    const latestSoilAnalysis = soilAnalysisRecords[0];

    return { latestSoilAnalysis, errors, soilAnalysisRecords };
  }

  private handleCropValidation(crop: CropEntity) {
    const errors: string[] = [];

    if (!crop) {
      errors.push('Crop is required');
    }

    if (crop.Year === null) {
      errors.push('Year is required in crop');
    }
    if (crop.CropTypeID === null) {
      errors.push('CropTypeId is required in crop');
    }

    if (crop.FieldID === null) {
      errors.push('FieldID is required in crop');
    }

    return errors;
  }

  async getSnsAnalysesData(id: number) {
    const data = await this.snsAnalysisRepository.findOne({
      where: { FieldID: id }, // This line is correct as per your entity definition
    });

    return data;
  }

  async createNutrientsRecommendationForField(
    crops: CreateCropWithManagementPeriodsDto[],
    userId: number,
  ) {
    return await this.entityManager.transaction(
      async (transactionalManager) => {
        const Recommendations = [];
        const Errors: string[] = [];
        for (const cropData of crops) {
          const crop = cropData?.Crop;
          const errors = this.handleCropValidation(crop);
          Errors.push(...errors);
          const fieldId = crop.FieldID;

          const { field, errors: fieldErrors } =
            await this.handleFieldValidation(fieldId);
          Errors.push(...fieldErrors);

          const { farm, errors: farmErrors } = await this.handleFarmValidation(
            field.FarmID,
          );
          Errors.push(...farmErrors);

          const {
            latestSoilAnalysis,
            errors: soilAnalysisErrors,
            soilAnalysisRecords,
          } = await this.handleSoilAnalysisValidation(
            fieldId,
            field.Name,
            crop?.Year,
          );
          Errors.push(...soilAnalysisErrors);
          if (Errors.length > 0)
            throw new HttpException(
              JSON.stringify(Errors),
              HttpStatus.BAD_REQUEST,
            );

          const snsAnalysesData = await this.getSnsAnalysesData(fieldId);
          const nutrientRecommendationnReqBody =
            await this.buildNutrientRecommendationReqBody(
              field,
              farm,
              soilAnalysisRecords,
              snsAnalysesData,
              crop,
            );
           
          const nutrientRecommendationsData =
            await this.rB209RecommendationService.postData(
              'Recommendation/Recommendations',
              nutrientRecommendationnReqBody,
            );

          if (
            !nutrientRecommendationsData.recommendations ||
            !nutrientRecommendationsData.adviceNotes ||
            nutrientRecommendationsData.errors ||
            nutrientRecommendationsData.error
          ) {
            throw new HttpException(
              JSON.stringify(nutrientRecommendationsData),
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }

          const savedCrop = await transactionalManager.save(
            this.cropRepository.create({
              ...crop,
              CreatedByID: userId,
            }),
          );
          const ManagementPeriods: ManagementPeriodEntity[] = [];
          for (const managementPeriod of cropData.ManagementPeriods) {
            const savedManagementPeriod = await transactionalManager.save(
              this.managementPeriodRepository.create({
                ...managementPeriod,
                CropID: savedCrop.ID,
                CreatedByID: userId,
              }),
            );
            ManagementPeriods.push(savedManagementPeriod);
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
              CropLime: cropNutrientsValue.CropLime,
              FertilizerN: cropNutrientsValue.N,
              FertilizerP2O5: cropNutrientsValue.P2O5,
              FertilizerK2O: cropNutrientsValue.K2O,
              FertilizerMgO: cropNutrientsValue.MgO,
              FertilizerSO3: cropNutrientsValue.SO3,
              FertilizerNa2O: cropNutrientsValue.Na2O,
              FertilizerLime: cropNutrientsValue.FertilizerLime,
              PH: latestSoilAnalysis?.PH?.toString(),
              SNSIndex: latestSoilAnalysis?.SoilNitrogenSupplyIndex?.toString(),
              PIndex: latestSoilAnalysis?.PhosphorusIndex?.toString(),
              KIndex: latestSoilAnalysis?.PotassiumIndex?.toString(),
              MgIndex: latestSoilAnalysis?.MagnesiumIndex?.toString(),
              ManagementPeriodID: ManagementPeriods[0].ID,
              Comments: `Reference Value: ${nutrientRecommendationsData.referenceValue}\nVersion: ${nutrientRecommendationsData.versionNumber}`,
              CreatedOn: savedCrop.CreatedOn,
              CreatedByID: savedCrop.CreatedByID,
            }),
          );
          const RecommendationComments: RecommendationCommentEntity[] = [];
          const notesByNutrient =
            nutrientRecommendationsData.adviceNotes.reduce(
              (acc, adviceNote) => {
                if (!acc[adviceNote.nutrientId]) {
                  acc[adviceNote.nutrientId] = [];
                }
                acc[adviceNote.nutrientId].push(adviceNote.note); // Group notes by nutrientId
                return acc;
              },
              {} as { [key: number]: string[] },
            );
          for (const nutrientId in notesByNutrient) {
            const concatenatedNote = notesByNutrient[nutrientId].join(' '); // Concatenate notes for the same nutrientId

            // Create a new recommendation comment with the concatenated notes
            const newComment = this.recommendationCommentEntity.create({
              Nutrient: parseInt(nutrientId),
              Comment: concatenatedNote, // Store concatenated notes
              RecommendationID: savedRecommendation.ID,
              CreatedOn: savedCrop.CreatedOn,
              CreatedByID: savedCrop.CreatedByID,
            });

            const savedRecommendationComment =
              await transactionalManager.save(newComment);

            RecommendationComments.push(savedRecommendationComment); // Push saved comment
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

  async getCropsPlansCropTypesByHarvestYear(
    farmId: number,
    harvestYear: number,
  ) {
    try {
      const storedProcedure =
        'EXEC dbo.spCrops_GetCropPlansCropTypesByHarvestYear @farmId = @0, @harvestYear = @1';
      const plans = await this.executeQuery(storedProcedure, [
        farmId,
        harvestYear,
      ]);

      return await this.mapCropTypeIdWithTheirNames(plans);
    } catch (error) {
      console.error(
        'Error while fetching crop plans croptypes join data by farmId and harvest year:',
        error,
      );
      throw error;
    }
  }

  async getCropsPlanFields(
    farmId: number,
    harvestYear: number,
    cropTypeId: number,
  ) {
    try {
      const storedProcedure =
        'EXEC dbo.spCrops_GetCropPlansFieldsByHarvestYear @farmId = @0, @harvestYear = @1, @cropTypeId = @2';
      const plans = await this.executeQuery(storedProcedure, [
        farmId,
        harvestYear,
        cropTypeId,
      ]);
      return plans;
    } catch (error) {
      console.error(
        'Error while fetching crop plans fields join data using farmId, harvest year and crop typeId:',
        error,
      );
      throw error;
    }
  }

  async getCropsPlansManagementPeriodIds(
    fieldIds: string,
    harvestYear: number,
    cropTypeId: number,
  ) {
    try {
      const storedProcedure =
        'EXEC dbo.spCrops_GetCropPlansManagementPeriodByHarvestYear @fieldIds = @0, @harvestYear = @1, @cropTypeId = @2';
      const plans = await this.executeQuery(storedProcedure, [
        fieldIds,
        harvestYear,
        cropTypeId,
      ]);
      return { ManagementPeriods: plans };
    } catch (error) {
      console.error(
        'Error while fetching crop plans management period ids using fieldIds,  harvest year and crop typeId:',
        error,
      );
      throw error;
    }
  }
}
