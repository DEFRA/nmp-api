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

  private async buildNutrientRecommendationReqBody(
    field: FieldEntity,
    farm: FarmEntity,
    soilAnalysis: SoilAnalysisEntity,
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
        mannerManures: true,
        organicMaterials: [],
        mannerOutputs: [
          {
            id: crop.CropOrder,
            totalN: mannerOutputs.data.totalN,
            availableN: mannerOutputs.data.currentCropAvailableN,
            totalP: mannerOutputs.data.totalP2O5,
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
  async handleSoilAnalysisValidation(
    fieldId: number,
    fieldName: string,
    year: number,
  ) {
    const errors: string[] = [];
    const latestSoilAnalysis = (
      await this.soilAnalysisRepository.find({
        where: {
          FieldID: fieldId,
          Year: LessThanOrEqual(year),
        },
        order: { Date: 'DESC' },
        take: 1,
      })
    )[0];

    const soilRequiredKeys = [
      'Date',
      'PH',
      'SulphurDeficient',
      'SoilNitrogenSupplyIndex',
      'PhosphorusIndex',
      'PotassiumIndex',
      'MagnesiumIndex',
    ];

    if (latestSoilAnalysis)
      soilRequiredKeys.forEach((key) => {
        if (latestSoilAnalysis[key] === null) {
          errors.push(
            `${key} is required in soil analysis for field ${fieldName}`,
          );
        }
      });

    return { latestSoilAnalysis, errors };
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
          const manureTypeData = await this.manureTypeRepository.findOneBy({
            ID: OrganicManure.ManureTypeID,
          });
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
          const mannerOutputReq = {
            runType: farmData.EnglishRules ? 3 : 4,
            FarmID: organicManureData.FarmID,
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
            manureApplications: [
              {
                manureDetails: {
                  manureID: OrganicManure.ManureTypeID,
                  name: manureTypeData.Name,
                  isLiquid: manureTypeData.IsLiquid,
                  dryMatter: OrganicManure.DryMatterPercent,
                  totalN: OrganicManure?.N,
                  nH4N: OrganicManure.NH4N,
                  uric: OrganicManure.UricAcid,
                  nO3N: OrganicManure.NO3N,
                  p2O5: OrganicManure.P2O5,
                  sO3: OrganicManure.SO3,
                  k2O: OrganicManure.K2O,
                  mgO: OrganicManure.MgO,
                },
                applicationDate: applicationDate,
                applicationRate: {
                  value: OrganicManure.ApplicationRate,
                  unit: 'kg/hectare',
                },
                applicationMethodID: OrganicManure.ApplicationMethodID,
                incorporationMethodID: OrganicManure.IncorporationMethodID,
                incorporationDelayID: OrganicManure.IncorporationDelayID,
                autumnCropNitrogenUptake: {
                  value: OrganicManure.AutumnCropNitrogenUptake,
                  unit: 'string',
                },
                endOfDrainageDate: endOfDrainageDate,
                rainfallPostApplication: OrganicManure.Rainfall,
                cropNUptake: OrganicManure.AutumnCropNitrogenUptake,
                windspeedID: OrganicManure.WindspeedID,
                rainTypeID: OrganicManure.RainfallWithinSixHoursID,
                topsoilMoistureID: OrganicManure.MoistureID,
              },
            ],
          };

          const mannerOutputs =
            await this.MannerCalculateNutrientsService.postData(
              '/calculate-nutrients',
              mannerOutputReq,
            );

          const Errors = [];
          const { latestSoilAnalysis, errors: soilAnalysisErrors } =
            await this.handleSoilAnalysisValidation(
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

          const nutrientRecommendationnReqBody =
            await this.buildNutrientRecommendationReqBody(
              fieldData,
              farmData,
              latestSoilAnalysis,
              cropData,
              mannerOutputs,
              organicManureData,
            );

          const nutrientRecommendationsData =
            await this.rB209RecommendationService.postData(
              'Recommendation/Recommendations',
              nutrientRecommendationnReqBody,
            );

          // const nutrientData = await this.RB209FieldService.getData(
          //   `Nutrient/:${nutrientRecommendationsData.NutrientID}`,
          // );
          console.log(
            'nutrientRecommendationsData',
            nutrientRecommendationsData.calculations
          );
          if (
            nutrientRecommendationsData.calculations
          ) {
            // Step 2: Extract all nutrientIds from the response
            const nutrientIds =
              nutrientRecommendationsData.calculations.map(
                (calculation) => calculation.nutrientId,
              );
              console.log('nutrientIds', nutrientIds);
            // Step 3: Loop through the nutrientIds and hit the `Nutrient/:NutrientID` API
            const nutrientDetailsArray = [];

            for (const nutrientId of nutrientIds) {
              try {
                const nutrientData = await this.RB209FieldService.getData(
                  `Nutrient/${nutrientId}`,
                );
                console.log('nutrientDataaaa', nutrientData);
                // Store the nutrient data for further processing or use
                nutrientDetailsArray.push(nutrientData);

                console.log(`Data for NutrientID ${nutrientId}:`, nutrientData);
              } catch (error) {
                console.error(
                  `Failed to fetch data for NutrientID ${nutrientId}:`,
                  error,
                );
              }
            }

            // Now you have all the nutrient details in nutrientDetailsArray for further use
            console.log('All Nutrient Details:', nutrientDetailsArray);
          } else {
            console.error(
              'Failed to fetch nutrient recommendations data:',
              nutrientRecommendationsData,
            );
          }
          
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
              AvailableN: mannerOutputs.data.currentCropAvailableN,
              CreatedByID: userId,
            }),
          );
          organicManures.push(savedOrganicManure);
          const updateRecommendationData = {
            ManagementPeriodID: managementPeriodData.ID,
            CropN: 50.123,
            CropP2O5: 20.456,
            CropK2O: 30.789,
            CropMgO: 10.123,
            CropSO3: 15.456,
            CropNa2O: 5.789,
            CropLime: 8.123,
            ManureN: 25.456,
            ManureP2O5: 12.789,
            ManureK2O: 15.123,
            ManureMgO: 7.456,
            ManureSO3: 9.789,
            ManureNa2O: 4.123,
            ManureLime: 6.456,
            FertilizerN: 55.789,
            FertilizerP2O5: 22.123,
            FertilizerK2O: 33.456,
            FertilizerMgO: 18.789,
            FertilizerSO3: 25.123,
            FertilizerNa2O: 8.456,
            FertilizerLime: 10.789,
            PH: '6.5',
            SNSIndex: 'Medium',
            PIndex: 'High',
            KIndex: 'Low',
            MgIndex: 'Moderate',
            SIndex: 'Low',
            NaIndex: 'Moderate',
            Comments: 'Updated recommendation for Crop NPK values.',
            PreviousID: 10,
          };
          const updatedData =
            await this.updateRecommendationByManagementPeriodID(
              updateRecommendationData.ManagementPeriodID,
              updateRecommendationData,
            );
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
  ) {
    const recommendation = await this.RecommendationRepository.findOne({
      where: { ManagementPeriodID: managementPeriodID },
    });
    if (!recommendation) {
      throw new Error(
        'Recommendation not found for the given ManagementPeriodID',
      );
    }

    // Update recommendation values
    const updatedRecommendation = {
      ...recommendation,
      ...updateData, // Spread operator to merge new data into the recommendation
    };

    // Save the updated recommendation
    return await this.RecommendationRepository.save(updatedRecommendation);
  }

  async checkManureExists(
    dateFrom: Date,
    dateTo: Date,
    confirm: boolean,
  ): Promise<boolean> {
    // Use QueryBuilder to get manure types where IsLiquid is true OR ManureTypeID = 8
    const liquidManureTypes = await this.manureTypeRepository
      .createQueryBuilder('manureType')
      .where('manureType.IsLiquid = :isLiquid', { isLiquid: true })
      .orWhere('manureType.ID = :manureTypeId', { manureTypeId: 8 }) // for Poultry manure
      .getMany();

    // Extract manureTypeIds from the result
    const manureTypeIds = liquidManureTypes.map((manure) => manure.ID);

    // Query OrganicManures for these manureTypeIds within the date range
    const manureTypeExists = await this.repository
      .createQueryBuilder('organicManure')
      .where('organicManure.ManureTypeID IN (:...manureTypeIds)', {
        manureTypeIds,
      })
      .andWhere('organicManure.ApplicationDate BETWEEN :dateFrom AND :dateTo', {
        dateFrom,
        dateTo,
      })
      .andWhere('organicManure.Confirm = :confirm', { confirm })
      .getCount();

    // Return true if any matching records found
    return manureTypeExists > 0;
  }
}
