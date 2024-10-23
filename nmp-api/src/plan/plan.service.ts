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

  async getManagementPeriods(id: number) {
    const data = await this.managementPeriodRepository.findOne({
      where: {
        CropID: id,
      },
    });

    return data;
  }

  async getFirstCropData(FieldID, Year) {
    const data = await this.cropRepository.findOne({
      where: {
        FieldID: FieldID,
        Year: Year,
        Confirm: false, // Or 0 based on your field setup
        CropOrder: 1,
      },
    });
    return data;
  }

  private async buildArableBody(
    crop: CropEntity,
    field: FieldEntity,
  ): Promise<any[]> {
    const arableBody = [];

    // Fetch cropType for the current crop (CropOrder 1 or 2)
    const cropTypesList: any[] =
      await this.rB209ArableService.getData('/Arable/CropTypes');
    const currentCropType = cropTypesList.find(
      (cropType) => cropType.cropTypeId === crop.CropTypeID,
    );

    if (!currentCropType || currentCropType.cropGroupId === null) {
      throw new HttpException(
        `Invalid CropTypeId for crop having field name ${field.Name}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // If CropOrder is 1, add only the current crop's data
    if (crop.CropOrder === 1) {
      arableBody.push({
        cropOrder: crop.CropOrder,
        cropGroupId: currentCropType.cropGroupId,
        cropTypeId: crop.CropTypeID,
        cropInfo1Id: crop.CropInfo1,
        cropInfo2Id: crop.CropInfo2,
        sowingDate: crop.SowingDate,
        expectedYield: crop.Yield,
      });
    }

    // If CropOrder is 2, find the crop with CropOrder 1 and add both crops
    if (crop.CropOrder === 2) {
      // Find the previous crop with CropOrder 1

      const previousCrop = await this.getFirstCropData(field.ID, crop.Year);

      if (previousCrop) {
        // Fetch cropType for the previous crop
        const previousCropType = cropTypesList.find(
          (cropType) => cropType.cropTypeId === previousCrop.CropTypeID,
        );

        if (!previousCropType || previousCropType.cropGroupId === null) {
          throw new HttpException(
            `Invalid CropTypeId for previous crop having field name ${field.Name}`,
            HttpStatus.BAD_REQUEST,
          );
        }

        // Add CropOrder 1 (previous crop)
        arableBody.push({
          cropOrder: previousCrop.CropOrder,
          cropGroupId: previousCropType.cropGroupId,
          cropTypeId: previousCrop.CropTypeID,
          cropInfo1Id: previousCrop.CropInfo1,
          cropInfo2Id: previousCrop.CropInfo2,
          sowingDate: previousCrop.SowingDate,
          expectedYield: previousCrop.Yield,
        });
      }

      // Add CropOrder 2 (current crop)
      arableBody.push({
        cropOrder: crop.CropOrder,
        cropGroupId: currentCropType.cropGroupId,
        cropTypeId: crop.CropTypeID,
        cropInfo1Id: crop.CropInfo1,
        cropInfo2Id: crop.CropInfo2,
        sowingDate: crop.SowingDate,
        expectedYield: crop.Yield,
      });
    }

    return arableBody;
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
    // Use the buildArableBody function to get the arable array
    const arableBody = await this.buildArableBody(crop, field);
    console.log('arableBody', arableBody);
    const nutrientRecommendationnReqBody = {
      field: {
        fieldType: crop.FieldType,
        multipleCrops: true,
        arable: arableBody,
        grassland:
          crop.CropOrder == 1
            ? {
                cropOrder: null,
                snsId: null,
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
              }
            : {},
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

  async saveRecommendationForMutipleCrops(
    transactionalManager,
    nutrientRecommendationsData,
    savedCrop,
    firstCropData,
    managementPeriodData,
    ManagementPeriods,
    userId,
  ) {
    // Initialize variables for recommendations for both Crop Orders
    let cropOrder1Data = {
      CropN: 0,
      ManureN: 0,
      FertilizerN: 0,
      CropP2O5: 0,
      ManureP2O5: 0,
      FertilizerP2O5: 0,
      CropK2O: 0,
      ManureK2O: 0,
      FertilizerK2O: 0,
      CropMgO: 0,
      ManureMgO: 0,
      FertilizerMgO: 0,
      CropSO3: 0,
      ManureSO3: 0,
      FertilizerSO3: 0,
      CropNa2O: 0,
      ManureNa2O: 0,
      FertilizerNa2O: 0,
      CropLime: 0,
      ManureLime: 0,
      FertilizerLime: 0,
    };

    let cropOrder2Data = {
      CropN: 0,
      ManureN: 0,
      FertilizerN: 0,
      CropP2O5: 0,
      ManureP2O5: 0,
      FertilizerP2O5: 0,
      CropK2O: 0,
      ManureK2O: 0,
      FertilizerK2O: 0,
      CropMgO: 0,
      ManureMgO: 0,
      FertilizerMgO: 0,
      CropSO3: 0,
      ManureSO3: 0,
      FertilizerSO3: 0,
      CropNa2O: 0,
      ManureNa2O: 0,
      FertilizerNa2O: 0,
      CropLime: 0,
      ManureLime: 0,
      FertilizerLime: 0,
    };

    // Iterate through the nutrient recommendations data
    nutrientRecommendationsData.calculations.forEach((calculation) => {
      const nutrientId = calculation.nutrientId;
      const sequenceId = calculation.sequenceId;

      switch (nutrientId) {
        case 0:
          // Nitrogen (N) handling
          if (sequenceId === 1) {
            cropOrder1Data.CropN = calculation.recommendation;
            cropOrder1Data.ManureN = calculation.applied;
            cropOrder1Data.FertilizerN = calculation.cropNeed;
          } else if (sequenceId === 2) {
            cropOrder2Data.CropN = calculation.recommendation;
            cropOrder2Data.ManureN = calculation.applied;
            cropOrder2Data.FertilizerN = calculation.cropNeed;
          }
          break;
        case 1:
          // Phosphorus (P2O5) handling
          if (sequenceId === 1) {
            cropOrder1Data.CropP2O5 = calculation.recommendation;
            cropOrder1Data.ManureP2O5 = calculation.applied;
            cropOrder1Data.FertilizerP2O5 = calculation.cropNeed;
          } else if (sequenceId === 2) {
            cropOrder2Data.CropP2O5 = calculation.recommendation;
            cropOrder2Data.ManureP2O5 = calculation.applied;
            cropOrder2Data.FertilizerP2O5 = calculation.cropNeed;
          }
          break;
        case 2:
          // Potassium (K2O) handling
          if (sequenceId === 1) {
            cropOrder1Data.CropK2O = calculation.recommendation;
            cropOrder1Data.ManureK2O = calculation.applied;
            cropOrder1Data.FertilizerK2O = calculation.cropNeed;
          } else if (sequenceId === 2) {
            cropOrder2Data.CropK2O = calculation.recommendation;
            cropOrder2Data.ManureK2O = calculation.applied;
            cropOrder2Data.FertilizerK2O = calculation.cropNeed;
          }
          break;
        case 3:
          // Magnesium (MgO) handling
          if (sequenceId === 1) {
            cropOrder1Data.CropMgO = calculation.recommendation;
            cropOrder1Data.ManureMgO = calculation.applied;
            cropOrder1Data.FertilizerMgO = calculation.cropNeed;
          } else if (sequenceId === 2) {
            cropOrder2Data.CropMgO = calculation.recommendation;
            cropOrder2Data.ManureMgO = calculation.applied;
            cropOrder2Data.FertilizerMgO = calculation.cropNeed;
          }
          break;
        case 4:
          // Sulfur (SO3) handling
          if (sequenceId === 1) {
            cropOrder1Data.CropSO3 = calculation.recommendation;
            cropOrder1Data.ManureSO3 = calculation.applied;
            cropOrder1Data.FertilizerSO3 = calculation.cropNeed;
          } else if (sequenceId === 2) {
            cropOrder2Data.CropSO3 = calculation.recommendation;
            cropOrder2Data.ManureSO3 = calculation.applied;
            cropOrder2Data.FertilizerSO3 = calculation.cropNeed;
          }
          break;
        case 5:
          // Sodium (Na2O) handling
          if (sequenceId === 1) {
            cropOrder1Data.CropNa2O = calculation.recommendation;
            cropOrder1Data.ManureNa2O = calculation.applied;
            cropOrder1Data.FertilizerNa2O = calculation.cropNeed;
          } else if (sequenceId === 2) {
            cropOrder2Data.CropNa2O = calculation.recommendation;
            cropOrder2Data.ManureNa2O = calculation.applied;
            cropOrder2Data.FertilizerNa2O = calculation.cropNeed;
          }
          break;
        case 6:
          // Lime handling
          if (sequenceId === 1) {
            cropOrder1Data.CropLime = calculation.recommendation;
            cropOrder1Data.ManureLime = calculation.applied;
            cropOrder1Data.FertilizerLime = calculation.cropNeed;
          } else if (sequenceId === 2) {
            cropOrder2Data.CropLime = calculation.recommendation;
            cropOrder2Data.ManureLime = calculation.applied;
            cropOrder2Data.FertilizerLime = calculation.cropNeed;
          }
          break;
        default:
          break;
      }
    });

    // Save or update for Crop Order 1
    let firstCropSaveData = await this.repository.findOne({
      where: { ManagementPeriodID: managementPeriodData.ID },
    });

    if (firstCropSaveData) {
      // Update existing recommendation
      firstCropSaveData = {
        ...firstCropSaveData,
        ...cropOrder1Data,
        ModifiedByID: userId,
        ModifiedOn: new Date(),
        Comments: `Reference Value: ${nutrientRecommendationsData.referenceValue}\nVersion: ${nutrientRecommendationsData.versionNumber}`,
      };
      await transactionalManager.save(RecommendationEntity, firstCropSaveData);
    } else {
      // Create a new recommendation
      firstCropSaveData = await transactionalManager.save(
        this.repository.create({
          ...cropOrder1Data,
          ManagementPeriodID: managementPeriodData.ID,
          Comments: `Reference Value: ${nutrientRecommendationsData.referenceValue}\nVersion: ${nutrientRecommendationsData.versionNumber}`,
          CreatedOn: new Date(),
          CreatedByID: userId,
        }),
      );
    }
    console.log('bkjdbcdkb', ManagementPeriods[0].ID);
    let managementPeriodIdSecondCrop = ManagementPeriods[0]?.ID;
    // Save or update for Crop Order 2
    let secondCropSaveData;
    // let secondCropSaveData = await this.repository.findOne({
    //   where: { ManagementPeriodID: managementPeriodIdSecondCrop },
    // });

    // if (secondCropSaveData) {
    //   // Update existing recommendation
    //   secondCropSaveData = {
    //     ...secondCropSaveData,
    //     ...cropOrder2Data,
    //     Comments: `Reference Value: ${nutrientRecommendationsData.referenceValue}\nVersion: ${nutrientRecommendationsData.versionNumber}`,
    //   };
    //   await transactionalManager.save(RecommendationEntity,secondCropSaveData);
    // } else
    //{
    // Create a new recommendation
    secondCropSaveData = await transactionalManager.save(
      this.repository.create({
        ...cropOrder2Data,
        ManagementPeriodID: ManagementPeriods[0].ID,
        Comments: `Reference Value: ${nutrientRecommendationsData.referenceValue}\nVersion: ${nutrientRecommendationsData.versionNumber}`,
        CreatedOn: new Date(),
        CreatedByID: userId,
      }),
    );
    //}

    return {
      firstCropSaveData,
      secondCropSaveData,
    };
  }

  async saveMultipleRecommendation(
    Recommendations,
    firstCropSaveData, // First crop data
    secondCropSaveData, // Second crop data
    transactionalManager,
    nutrientRecommendationsData,
    userId,
  ) {
    const RecommendationComments: RecommendationCommentEntity[] = [];

    // Separate advice notes by sequenceId for first crop (sequenceId = 1) and second crop (sequenceId = 2)
    const firstCropNotes = nutrientRecommendationsData.adviceNotes?.filter(
      (note) => note.sequenceId === 1,
    );
    const secondCropNotes = nutrientRecommendationsData.adviceNotes?.filter(
      (note) => note.sequenceId === 2,
    );

    // Helper function to group notes by nutrientId and concatenate them
    const groupNotesByNutrientId = (notes) => {
      return notes.reduce(
        (acc, adviceNote) => {
          const nutrientId = adviceNote.nutrientId;
          if (!acc[nutrientId]) {
            acc[nutrientId] = [];
          }
          acc[nutrientId].push(adviceNote.note); // Group notes by nutrientId
          return acc;
        },
        {} as { [key: number]: string[] },
      );
    };

    const firstCropNotesByNutrientId = groupNotesByNutrientId(firstCropNotes);
    const secondCropNotesByNutrientId = groupNotesByNutrientId(secondCropNotes);

    // Track nutrient IDs that are being processed
    const nutrientIdsInData = [];

    // Function to handle saving comments (with updates or creations)
    const saveComments = async (notesByNutrientId, savedCrop) => {
      const existingComments = await transactionalManager.find(
        RecommendationCommentEntity,
        { where: { RecommendationID: savedCrop.ID } },
      );

      for (const nutrientId in notesByNutrientId) {
        const concatenatedNote = notesByNutrientId[nutrientId].join(' '); // Concatenate notes for the same nutrientId

        // Add nutrientId to the processed list
        nutrientIdsInData.push(parseInt(nutrientId));

        // Check if the comment already exists for this nutrientId in the database
        const existingComment = existingComments.find(
          (comment) => comment.Nutrient === parseInt(nutrientId),
        );

        if (existingComment) {
          // Update existing comment if found
          existingComment.Comment = concatenatedNote;
          existingComment.ModifiedOn = new Date();
          existingComment.ModifiedByID = userId;

          const updatedComment =
            await transactionalManager.save(existingComment);
          RecommendationComments.push(updatedComment);
        } else {
          // Create a new comment if not found
          const newComment = this.recommendationCommentEntity.create({
            Nutrient: parseInt(nutrientId),
            Comment: concatenatedNote,
            RecommendationID: savedCrop.ID, // Use the correct recommendation ID from the passed crop data
            CreatedOn: new Date(),
            CreatedByID: userId,
          });

          const savedComment = await transactionalManager.save(newComment);
          RecommendationComments.push(savedComment);
        }
      }

      // Remove comments from the database if the nutrientId is not in the new data
      const commentsToDelete = existingComments.filter(
        (comment) => !nutrientIdsInData.includes(comment.Nutrient),
      );

      if (commentsToDelete.length > 0) {
        await transactionalManager.remove(
          RecommendationCommentEntity,
          commentsToDelete,
        );
      }
    };

    // Handle notes for the first crop (sequenceId = 1)
    await saveComments(firstCropNotesByNutrientId, firstCropSaveData);

    // Handle notes for the second crop (sequenceId = 2)
    await saveComments(secondCropNotesByNutrientId, secondCropSaveData);

    // Push the first crop recommendation and its comments to the final result array
    Recommendations.push({
      Recommendation: firstCropSaveData, // First crop recommendation
      RecommendationComments,
    });

    // Push the second crop recommendation and its comments to the final result array
    Recommendations.push({
      Recommendation: secondCropSaveData, // Second crop recommendation
      RecommendationComments,
    });
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
          console.log(
            'nutrientRecommendationnReqBody',
            nutrientRecommendationnReqBody,
          );
          const nutrientRecommendationsData =
            await this.rB209RecommendationService.postData(
              'Recommendation/Recommendations',
              nutrientRecommendationnReqBody,
            );
          console.log(
            'nutrientRecommendationsData',
            nutrientRecommendationsData,
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
          console.log('ManagementPeriods', ManagementPeriods[0].ID);
          let savedRecommendation;
          if (crop.CropOrder == 2) {
            const firstCropData = await this.getFirstCropData(
              field.ID,
              crop.Year,
            );

            const managementPeriodData = await this.getManagementPeriods(
              firstCropData.ID,
            );
            console.log('managementPeriodData', managementPeriodData.ID);
            const savedMultipleCropRecommendation =
              await this.saveRecommendationForMutipleCrops(
                transactionalManager,
                nutrientRecommendationsData,
                savedCrop,
                firstCropData,
                managementPeriodData,
                ManagementPeriods,
                userId,
              );
            console.log(
              'savedMultipleCropRecommendation',
              savedMultipleCropRecommendation,
            );

            const savedFirstRecommendationComment =
              await this.saveMultipleRecommendation(
                Recommendations,
                savedMultipleCropRecommendation.firstCropSaveData,
                savedMultipleCropRecommendation.secondCropSaveData,
                transactionalManager,
                nutrientRecommendationsData,
                userId,
              );
            // const secondCropSaveRecoomendationComment =
            //   await this.saveMultipleRecommendation(
            //     Recommendations,
            //     savedMultipleCropRecommendation.secondCropSaveData,
            //     transactionalManager,
            //     nutrientRecommendationsData,
            //     userId,
            //   );
          } else {
            const cropNutrientsValue: any = {};
            nutrientRecommendationsData.recommendations.forEach(
              (recommendation) => {
                cropNutrientsValue[NutrientsMapper[recommendation.nutrientId]] =
                  recommendation.cropNeedValue;
              },
            );

            savedRecommendation = await transactionalManager.save(
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
                SNSIndex:
                  latestSoilAnalysis?.SoilNitrogenSupplyIndex?.toString(),
                PIndex: latestSoilAnalysis?.PhosphorusIndex?.toString(),
                KIndex: latestSoilAnalysis?.PotassiumIndex?.toString(),
                MgIndex: latestSoilAnalysis?.MagnesiumIndex?.toString(),
                ManagementPeriodID: ManagementPeriods[0]?.ID,
                Comments: `Reference Value: ${nutrientRecommendationsData.referenceValue}\nVersion: ${nutrientRecommendationsData.versionNumber}`,
                CreatedOn: new Date(),
                CreatedByID: userId,
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
                RecommendationID: savedRecommendation?.ID,
                CreatedOn: new Date(),
                CreatedByID: userId,
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
