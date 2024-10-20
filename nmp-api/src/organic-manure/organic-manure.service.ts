import { OrganicManureEntity } from '@db/entity/organic-manure.entity';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiDataResponseType } from '@shared/base.response';
import { BaseService } from '@src/base/base.service';
import {
  Between,
  EntityManager,
  In,
  LessThanOrEqual,
  Not,
  Repository,
} from 'typeorm';
import { CreateOrganicManuresWithFarmManureTypeDto } from './dto/organic-manure.dto';
import FarmManureTypeEntity from '@db/entity/farm-manure-type.entity';
import CropEntity from '@db/entity/crop.entity';
import ManagementPeriodEntity from '@db/entity/management-period.entity';
import { ManureTypeEntity } from '@db/entity/manure-type.entity';
import { MannerCalculateNutrientsService } from '@src/vendors/manner/calculate-nutrients/calculate-nutrients.service';
import FieldEntity from '@db/entity/field.entity';
import { first } from 'rxjs';
import FarmEntity from '@db/entity/farm.entity';
import { CropTypeLinkingEntity } from '@db/entity/crop-type-linking.entity';
import { validateISODateFormat } from '@shared/dateValidate';
import SoilAnalysisEntity from '@db/entity/soil-analysis.entity';
import { RB209ArableService } from '@src/vendors/rb209/arable/arable.service';
import { RB209RecommendationService } from '@src/vendors/rb209/recommendation/recommendation.service';
import { RecommendationEntity } from '@db/entity/recommendation.entity';
import { RB209FieldService } from '@src/vendors/rb209/field/field.service';
import { RecommendationCommentEntity } from '@db/entity/recommendation-comment.entity';
import { MannerManureTypesService } from '@src/vendors/manner/manure-types/manure-types.service';
import SnsAnalysesEntity from '@db/entity/sns-analysis.entity';

@Injectable()
export class OrganicManureService extends BaseService<
  OrganicManureEntity,
  ApiDataResponseType<OrganicManureEntity>
> {
  constructor(
    @InjectRepository(OrganicManureEntity)
    protected readonly repository: Repository<OrganicManureEntity>,
    @InjectRepository(FarmManureTypeEntity)
    protected readonly farmManureTypeRepository: Repository<FarmManureTypeEntity>,
    @InjectRepository(CropEntity)
    protected readonly cropRepository: Repository<CropEntity>,
    @InjectRepository(ManagementPeriodEntity)
    protected readonly managementPeriodRepository: Repository<ManagementPeriodEntity>,
    protected readonly entityManager: EntityManager,
    @InjectRepository(ManureTypeEntity)
    protected readonly manureTypeRepository: Repository<ManureTypeEntity>,
    protected readonly MannerCalculateNutrientsService: MannerCalculateNutrientsService,
    @InjectRepository(FieldEntity)
    protected readonly fieldRepository: Repository<FieldEntity>,
    @InjectRepository(FarmEntity)
    protected readonly farmRepository: Repository<FarmEntity>,
    @InjectRepository(CropTypeLinkingEntity)
    protected readonly CropTypeLinkingRepository: Repository<CropTypeLinkingEntity>,
    @InjectRepository(SoilAnalysisEntity)
    protected readonly soilAnalysisRepository: Repository<SoilAnalysisEntity>,
    protected readonly rB209ArableService: RB209ArableService,
    protected readonly rB209RecommendationService: RB209RecommendationService,
    @InjectRepository(RecommendationEntity)
    protected readonly RecommendationRepository: Repository<RecommendationEntity>,
    protected readonly RB209FieldService: RB209FieldService,
    @InjectRepository(RecommendationCommentEntity)
    protected readonly recommendationCommentEntity: Repository<RecommendationCommentEntity>,
    protected readonly MannerManureTypesService: MannerManureTypesService,
    @InjectRepository(SnsAnalysesEntity)
    protected readonly snsAnalysisRepository: Repository<SnsAnalysesEntity>,
  ) {
    super(repository, entityManager);
  }

  async getTotalNitrogen(
    managementPeriodID: number,
    fromDate: Date,
    toDate: Date,
    confirm: boolean,
  ) {
    const result = await this.repository
      .createQueryBuilder('organicManures')
      .select(
        'SUM(organicManures.N * organicManures.ApplicationRate)',
        'totalN',
      )
      .where('organicManures.ManagementPeriodID = :managementPeriodID', {
        managementPeriodID,
      })
      .andWhere(
        'organicManures.ApplicationDate BETWEEN :fromDate AND :toDate',
        { fromDate, toDate },
      )
      .andWhere('organicManures.Confirm =:confirm', { confirm })
      .getRawOne();

    return result.totalN;
  }

  async getManureTypeIdsbyFieldAndYear(
    fieldId: number,
    year: number,
    confirm: boolean,
  ) {
    const cropId = (
      await this.cropRepository.findOne({
        where: { FieldID: fieldId, Year: year, Confirm: confirm },
      })
    )?.ID;

    const managementPeriodId = (
      await this.managementPeriodRepository.findOne({
        where: { CropID: cropId },
      })
    )?.ID;

    const organicManures = await this.repository.find({
      where: {
        ManagementPeriodID: managementPeriodId,
      },
    });

    const manureTypeIds = organicManures.map((data) => data.ManureTypeID);
    return manureTypeIds;
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

  async getManagementPeriodId(id: number) {
    const data = await this.managementPeriodRepository.findOne({
      where: {
        CropID: id,
      },
      select: ['ID'], // Only select the ID column
    });

    return data?.ID; // Return only the ID field
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
    mannerOutputs,
    organicManureData,
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
    const arableBody = await this.buildArableBody(crop, field);
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
        mannerManures: true,
        organicMaterials: [],
        mannerOutputs: [
          {
            id: crop.CropOrder,
            totalN: mannerOutputs?.data.totalN,
            availableN: mannerOutputs?.data.currentCropAvailableN,
            totalP: mannerOutputs?.data.totalP2O5,
            availableP: mannerOutputs.data.cropAvailableP2O5,
            totalK: mannerOutputs.data.totalK2O,
            availableK: mannerOutputs.data.cropAvailableK2O,
            totalS: mannerOutputs.data.totalSO3,
            availableS: 0, //TODO:: need to find it
            totalM: mannerOutputs.data.totalMgO,
          },
        ],
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

    // Validate the most recent soil analysis (first record in the sorted array)
    const latestSoilAnalysis = soilAnalysisRecords[0];

    return { latestSoilAnalysis, errors, soilAnalysisRecords };
  }

  async buildManureApplications(
    managementPeriodID: number,
    manureTypeData: any,
  ): Promise<any[]> {
    const mulOrganicManuresData = await this.repository.find({
      where: { ManagementPeriodID: managementPeriodID },
    });

    return mulOrganicManuresData.map((manure) => ({
      manureDetails: {
        manureID: manure.ManureTypeID,
        name: manureTypeData.name,
        isLiquid: manureTypeData.isLiquid,
        dryMatter: manure.DryMatterPercent,
        totalN: manure.N,
        nH4N: manure.NH4N,
        uric: manure.UricAcid,
        nO3N: manure.NO3N,
        p2O5: manure.P2O5,
        sO3: manure.SO3,
        k2O: manure.K2O,
        mgO: manure.MgO,
      },
      applicationDate: new Date(manure.ApplicationDate)
        .toISOString()
        .split('T')[0],
      applicationRate: {
        value: manure.ApplicationRate,
        unit: 'kg/hectare',
      },
      applicationMethodID: manure.ApplicationMethodID,
      incorporationMethodID: manure.IncorporationMethodID,
      incorporationDelayID: manure.IncorporationDelayID,
      autumnCropNitrogenUptake: {
        value: manure.AutumnCropNitrogenUptake,
        unit: 'string', //unit assign
      },
      endOfDrainageDate: new Date(manure.EndOfDrain)
        .toISOString()
        .split('T')[0],
      rainfallPostApplication: manure.Rainfall,
      windspeedID: manure.WindspeedID,
      rainTypeID: manure.RainfallWithinSixHoursID,
      topsoilMoistureID: manure.MoistureID,
    }));
  }

  async buildMannerOutputReq(
    farmData: any,
    fieldData: any,
    cropTypeLinkingData: any,
    organicManureData: any,
    manureApplications: any[],
  ): Promise<any> {
    return {
      runType: farmData.EnglishRules ? 3 : 4,
      postcode: farmData.Postcode.split(' ')[0],
      countryID: farmData.EnglishRules ? 1 : 2,
      field: {
        fieldID: fieldData.ID,
        fieldName: fieldData.Name,
        MannerCropTypeID: cropTypeLinkingData.MannerCropTypeID,
        topsoilID: fieldData.TopSoilID,
        subsoilID: fieldData.SubSoilID,
        isInNVZ: fieldData.IsWithinNVZ,
      },
      manureApplications,
    };
  }
  async checkIfManagementPeriodExistsInOrganicManure(
    organicManure: any,
  ): Promise<boolean> {
    const managementPeriodExists = await this.repository.findOne({
      where: { ManagementPeriodID: organicManure.ManagementPeriodID },
    });

    if (managementPeriodExists) {
      return true;
    } else {
      return false;
    }
  }

  async getSnsAnalysesData(id: number) {
    const data = await this.snsAnalysisRepository.findOne({
      where: { FieldID: id }, // This line is correct as per your entity definition
    });

    return data;
  }
  async saveRecommendationForMultipleCrops(
    transactionalManager,
    nutrientRecommendationsData,
    userId,
    cropData,
    firstCropManagementPeriodId,
    secondCropManagementPeriodId,
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

    // Save for Crop Order 1
    let firstCropSaveData = await transactionalManager.save(
      this.RecommendationRepository.create({
        ...cropOrder1Data,
        ManagementPeriodID: firstCropManagementPeriodId,
        Comments:
          'Reference Value: ' +
          nutrientRecommendationsData.referenceValue +
          '\nVersion: ' +
          nutrientRecommendationsData.versionNumber,
        CreatedOn: new Date(),
        CreatedByID: userId,
      }),
    );

    // Save for Crop Order 2 if present
    let secondCropSaveData;
    if (cropData.CropOrder === 2) {
      secondCropSaveData = await transactionalManager.save(
        this.RecommendationRepository.create({
          ...cropOrder2Data,
          ManagementPeriodID: secondCropManagementPeriodId,
          Comments:
            'Reference Value: ' +
            nutrientRecommendationsData.referenceValue +
            '\nVersion: ' +
            nutrientRecommendationsData.versionNumber,
          CreatedOn: new Date(),
          CreatedByID: userId,
        }),
      );
    }

    // Return both crops if CropOrder is 2, otherwise return only the first crop
    return cropData.CropOrder === 2
      ? { firstCropSaveData, secondCropSaveData }
      : { firstCropSaveData };
  }

  async createOrganicManuresWithFarmManureType(
    body: CreateOrganicManuresWithFarmManureTypeDto,
    userId: number,
  ) {
    return await this.entityManager.transaction(
      async (transactionalManager) => {
        let savedFarmManureType: FarmManureTypeEntity | undefined;
        let farmManureTypeData: Partial<FarmManureTypeEntity>;
        const organicManures: OrganicManureEntity[] = [];

        for (const organicManureData of body.OrganicManures) {
          const { OrganicManure } = organicManureData;
          if (
            OrganicManure.NH4N + OrganicManure.NO3N + OrganicManure.UricAcid >
            OrganicManure.N
          ) {
            throw new BadRequestException(
              'NH4N + NO3N + UricAcid must be less than or equal to TotalN',
            );
          }
          const newOrganicManure =
            await this.checkIfManagementPeriodExistsInOrganicManure(
              OrganicManure,
            );
          // Convert the Date object to YYYY-MM-DD string format
          const applicationDateObj = new Date(OrganicManure.ApplicationDate);

          // Convert the Date object to YYYY-MM-DD format
          const applicationDate = applicationDateObj
            .toISOString()
            .split('T')[0]; // returns a Date object
          const endOfDrainageDateObj = new Date(OrganicManure.EndOfDrain);
          const endOfDrainageDate = endOfDrainageDateObj
            .toISOString()
            .split('T')[0];

          const mannerManureTypeData =
            await this.MannerManureTypesService.getData(
              `/manure-types/${OrganicManure.ManureTypeID}`,
            );

          const manureTypeData = mannerManureTypeData?.data;
          const managementPeriodData =
            await this.managementPeriodRepository.findOneBy({
              ID: OrganicManure.ManagementPeriodID,
            });

          const cropData = await this.cropRepository.findOneBy({
            ID: managementPeriodData.CropID,
          });
          const fieldData = await this.fieldRepository.findOneBy({
            ID: cropData.FieldID,
          });
          const farmData = await this.farmRepository.findOneBy({
            ID: organicManureData.FarmID,
          });
          const cropTypeLinkingData =
            await this.CropTypeLinkingRepository.findOneBy({
              CropTypeID: cropData.CropTypeID,
            });

          const manureApplications = await this.buildManureApplications(
            OrganicManure.ManagementPeriodID,
            manureTypeData,
          );
          let mannerOutputReq;
          if (newOrganicManure == true) {
            mannerOutputReq = await this.buildMannerOutputReq(
              farmData,
              fieldData,
              cropTypeLinkingData,
              organicManureData,
              manureApplications,
            );
          } else if (newOrganicManure == false) {
            mannerOutputReq = {
              runType: farmData.EnglishRules ? 3 : 4, //3
              postcode: farmData.Postcode.split(' ')[0], //TN11
              countryID: farmData.EnglishRules ? 1 : 2, //1
              field: {
                fieldID: fieldData.ID, //49
                fieldName: fieldData.Name, //SHREYASH FARM 36 Field
                MannerCropTypeID: cropTypeLinkingData.MannerCropTypeID, //4
                topsoilID: fieldData.TopSoilID, //1
                subsoilID: fieldData.SubSoilID, //1
                isInNVZ: fieldData.IsWithinNVZ, //true
              },
              manureApplications: [
                {
                  manureDetails: {
                    manureID: OrganicManure.ManureTypeID, //12
                    name: manureTypeData.name, //Pig slurry
                    isLiquid: manureTypeData.isLiquid, //true
                    dryMatter: OrganicManure.DryMatterPercent, //4
                    totalN: OrganicManure?.N, //3.6
                    nH4N: OrganicManure.NH4N, //2.5
                    uric: OrganicManure.UricAcid, //0
                    nO3N: OrganicManure.NO3N, //0
                    p2O5: OrganicManure.P2O5, //1.5
                    sO3: OrganicManure.SO3, //0.7
                    k2O: OrganicManure.K2O, //2.2
                    mgO: OrganicManure.MgO, //0.7
                  },
                  applicationDate: applicationDate, //2025-08-19
                  applicationRate: {
                    value: OrganicManure.ApplicationRate, //30
                    unit: 'kg/hectare',
                  },
                  applicationMethodID: OrganicManure.ApplicationMethodID, //5
                  incorporationMethodID: OrganicManure.IncorporationMethodID, //7
                  incorporationDelayID: OrganicManure.IncorporationDelayID, //15
                  autumnCropNitrogenUptake: {
                    value: OrganicManure.AutumnCropNitrogenUptake, //20
                    unit: 'string',
                  },
                  endOfDrainageDate: endOfDrainageDate, //2026-03-30
                  rainfallPostApplication: OrganicManure.Rainfall, //461
                  windspeedID: OrganicManure.WindspeedID, //1
                  rainTypeID: OrganicManure.RainfallWithinSixHoursID, //1
                  topsoilMoistureID: OrganicManure.MoistureID, //2
                },
              ],
            };
          }

          // Call the new helper function to create mannerOutputReq
          const mannerOutputs =
            await this.MannerCalculateNutrientsService.postData(
              '/calculate-nutrients',
              mannerOutputReq,
            );

          const Errors = [];
          const {
            latestSoilAnalysis,
            errors: soilAnalysisErrors,
            soilAnalysisRecords,
          } = await this.handleSoilAnalysisValidation(
            fieldData.ID,
            fieldData.Name,
            cropData?.Year,
          );
          Errors.push(...soilAnalysisErrors);
          if (Errors.length > 0)
            throw new HttpException(
              JSON.stringify(Errors),
              HttpStatus.BAD_REQUEST,
            );
          const snsAnalysesData = await this.getSnsAnalysesData(fieldData.ID);
          const nutrientRecommendationnReqBody =
            await this.buildNutrientRecommendationReqBody(
              fieldData,
              farmData,
              soilAnalysisRecords,
              snsAnalysesData,
              cropData,
              mannerOutputs,
              organicManureData,
            );

          const nutrientRecommendationsData =
            await this.rB209RecommendationService.postData(
              'Recommendation/Recommendations',
              nutrientRecommendationnReqBody,
            );

          if (organicManureData.SaveDefaultForFarm) {
            farmManureTypeData = {
              FarmID: organicManureData.FarmID,
              ManureTypeID: OrganicManure.ManureTypeID,
              FieldTypeID: organicManureData.FieldTypeID,
              TotalN: OrganicManure.N, //Nitogen
              DryMatter: OrganicManure.DryMatterPercent,
              NH4N: OrganicManure.NH4N, //ammonium
              Uric: OrganicManure.UricAcid, //uric acid
              NO3N: OrganicManure.NO3N, //nitrate
              P2O5: OrganicManure.P2O5,
              SO3: OrganicManure.SO3,
              K2O: OrganicManure.K2O,
              MgO: OrganicManure.MgO,
            };
          }

          const savedOrganicManure = await transactionalManager.save(
            this.repository.create({
              ...organicManureData.OrganicManure,
              AvailableN: mannerOutputs?.data?.currentCropAvailableN,
              CreatedByID: userId,
            }),
          );

          organicManures.push(savedOrganicManure);
          let arableNotes = nutrientRecommendationsData.arableNotes;
          if (cropData.CropOrder == 2) {
            const cropOrderFirstData = await this.getFirstCropData(
              fieldData.ID,
              cropData.Year,
            );

            const firstCropManagementPeriodId =
              await this.getManagementPeriodId(cropOrderFirstData.ID);

            const savedData = await this.saveRecommendationForMultipleCrops(
              transactionalManager,
              nutrientRecommendationsData,
              userId,
              cropData,
              firstCropManagementPeriodId,
              OrganicManure.ManagementPeriodID,
            );

            await this.saveOrUpdateArableNotes(
              arableNotes,
              savedData.firstCropSaveData,
              transactionalManager,
              userId,
            );
            await this.saveOrUpdateArableNotes(
              arableNotes,
              savedData.secondCropSaveData,
              transactionalManager,
              userId,
            );
          } else {
            const cropOrderFirstData = await this.getFirstCropData(
              fieldData.ID,
              cropData.Year,
            );

            const firstCropManagementPeriodId =
              await this.getManagementPeriodId(cropOrderFirstData.ID);

            const savedData = await this.saveRecommendationForMultipleCrops(
              transactionalManager,
              nutrientRecommendationsData,
              userId,
              cropData,
              firstCropManagementPeriodId,
              OrganicManure.ManagementPeriodID,
            );

            await this.saveOrUpdateArableNotes(
              arableNotes,
              savedData.firstCropSaveData,
              transactionalManager,
              userId,
            );
          }
        }
        if (farmManureTypeData) {
          const existingFarmManureType =
            await this.farmManureTypeRepository.findOne({
              where: {
                FarmID: farmManureTypeData.FarmID,
                ManureTypeID: farmManureTypeData.ManureTypeID,
              },
            });
          if (existingFarmManureType) {
            await this.farmManureTypeRepository.update(
              existingFarmManureType.ID,
              {
                ...farmManureTypeData,
                ModifiedByID: userId,
                ModifiedOn: new Date(),
              },
            );

            savedFarmManureType = {
              ...existingFarmManureType,
              ...farmManureTypeData,
              ModifiedByID: userId,
              ModifiedOn: new Date(),
            };
          } else {
            savedFarmManureType = await transactionalManager.save(
              this.farmManureTypeRepository.create({
                ...farmManureTypeData,
                CreatedByID: userId,
              }),
            );
          }
        }

        return {
          OrganicManures: organicManures,
          FarmManureType: savedFarmManureType,
        };
      },
    );
  }
  async updateRecommendationByManagementPeriodID(
    managementPeriodID: number,
    updateData,
    transactionalManager: EntityManager,
  ) {
    // find all by multiple management period
    let recommendation = await transactionalManager.findOne(
      RecommendationEntity,
      {
        where: { ManagementPeriodID: managementPeriodID },
      },
    );

    if (recommendation) {
      // If recommendation exists, update its values
      const updatedRecommendation = {
        ...recommendation,
        ...updateData, // Merge the update data with the existing recommendation
      };

      // Save the updated recommendation
      return await transactionalManager.save(
        RecommendationEntity,
        updatedRecommendation,
      );
    } else {
      // If recommendation doesn't exist, create a new one with the given data
      const newRecommendation = transactionalManager.create(
        RecommendationEntity,
        {
          ManagementPeriodID: managementPeriodID,
          ...updateData, // Spread the data to create a new recommendation
        },
      );

      // Save the new recommendation
      return await transactionalManager.save(
        RecommendationEntity,
        newRecommendation,
      );
    }
  }

  async saveOrUpdateArableNotes(
    arableNotes: { nutrientId: number; note: string; sequenceId: number }[],
    updatedData: any,
    transactionalManager: EntityManager,
    userId: number,
  ): Promise<void> {
    const recommendationComments: RecommendationCommentEntity[] = [];

    // Group arableNotes by nutrientId and sequenceId, and concatenate the notes
    const notesByNutrientAndSequence = arableNotes?.reduce(
      (acc, note) => {
        const key = `${note.nutrientId}-${note.sequenceId}`; // Create a unique key for nutrientId and sequenceId

        if (!acc[key]) {
          acc[key] = [];
        }

        acc[key].push(note.note); // Group notes by nutrientId and sequenceId

        return acc;
      },
      {} as { [key: string]: string[] }, // Accumulator object with nutrientId-sequenceId as the key
    );

    // Fetch existing comments for the RecommendationID from the database
    const existingComments = await transactionalManager.find(
      RecommendationCommentEntity,
      {
        where: { RecommendationID: updatedData.ID },
      },
    );

    const processedKeys = new Set<string>(); // Track processed nutrientId-sequenceId keys

    // Loop through the grouped arableNotes
    for (const key in notesByNutrientAndSequence) {
      const [nutrientId, sequenceId] = key.split('-').map(Number); // Extract nutrientId and sequenceId from the key
      const concatenatedNote = notesByNutrientAndSequence[key].join(' '); // Concatenate notes for the same nutrient and sequence

      const existingComment = existingComments.find(
        (comment) => comment.Nutrient === nutrientId,
      );

      if (existingComment) {
        // If a comment exists, update it with the new note
        existingComment.Comment = concatenatedNote;
        existingComment.ModifiedOn = new Date(); // Update modification timestamp
        existingComment.ModifiedByID = userId; // Update the user ID for modification
        await transactionalManager.save(existingComment);
      } else {
        // Create a new comment if it doesn't exist
        const newComment = this.recommendationCommentEntity.create({
          Nutrient: nutrientId,
          Comment: concatenatedNote,
          RecommendationID: updatedData.ID,
          CreatedOn: new Date(),
          CreatedByID: userId,
          ModifiedOn: new Date(),
          ModifiedByID: userId,
        });
        recommendationComments.push(newComment);
      }

      processedKeys.add(key); // Mark this nutrientId-sequenceId combination as processed
    }

    // Collect nutrientIds from arableNotes
    const nutrientIdsInNotes = arableNotes?.map((note) => note.nutrientId);

    if (nutrientIdsInNotes?.length > 0) {
      // Delete comments for nutrients that are no longer present in arableNotes
      await transactionalManager.delete(RecommendationCommentEntity, {
        RecommendationID: updatedData.ID,
        Nutrient: Not(In(nutrientIdsInNotes)), // Only match by nutrientId for deletion
      });
    }

    // Save all new recommendation comments if any were created
    if (recommendationComments.length > 0) {
      await transactionalManager.save(recommendationComments);
    }
  }

  async checkManureExists(
    dateFrom: Date,
    dateTo: Date,
    confirm: boolean,
  ): Promise<boolean> {
    try {
      // Fetch all manure types from the API
      const allManureTypes =
        await this.MannerManureTypesService.getData('/manure-types');

      if (!allManureTypes?.data || allManureTypes.data.length === 0) {
        // Log a error if no manure types are returned
        console.error('No manure types returned from the Manner API');
      }

      // Filter manure types: IsLiquid is true OR ManureTypeID = 8 (for Poultry manure)
      const liquidManureTypes = allManureTypes.data.filter(
        (manure) => manure.IsLiquid === true || manure.ID === 8,
      );

      if (!liquidManureTypes || liquidManureTypes.length === 0) {
        // Log a warning if no liquid or poultry manure types are found
        console.warn('No valid liquid or poultry manure types found');
      }

      // Extract manureTypeIds from the filtered result
      const manureTypeIds = liquidManureTypes.map((manure) => manure.ID);

      // If no valid manureTypeIds, return false
      if (!manureTypeIds || manureTypeIds.length === 0) {
        return false; // No valid manure types found
      }

      // Query OrganicManures for these manureTypeIds within the date range
      const manureTypeExists = await this.repository
        .createQueryBuilder('organicManure')
        .where('organicManure.ManureTypeID IN (:...manureTypeIds)', {
          manureTypeIds,
        })
        .andWhere(
          'organicManure.ApplicationDate BETWEEN :dateFrom AND :dateTo',
          {
            dateFrom,
            dateTo,
          },
        )
        .andWhere('organicManure.Confirm = :confirm', { confirm })
        .getCount();

      // Return true if any matching records are found
      return manureTypeExists > 0;
    } catch (error) {
      // Log the error for debugging purposes
      console.error('Error checking for manure existence:', error.message);

      // You can choose to throw the error or handle it silently
      throw new Error(
        'Failed to check manure existence due to an internal error',
      );
    }
  }
}
