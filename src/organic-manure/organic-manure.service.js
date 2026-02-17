const { AppDataSource } = require("../db/data-source");
const { MoreThan } = require("typeorm");
const { CropEntity } = require("../db/entity/crop.entity");
const boom = require("@hapi/boom");

const {
  FarmManureTypeEntity,
} = require("../db/entity/farm-manure-type.entity");
const {
  ManagementPeriodEntity,
} = require("../db/entity/management-period.entity");
const { OrganicManureEntity } = require("../db/entity/organic-manure.entity");
const { BaseService } = require("../base/base.service");
const { ManureTypeEntity } = require("../db/entity/manure-type.entity");
const {
  CalculateNutrientOfftakeDto,
} = require("../vendors/rb209/recommendation/dto/recommendation.dto");
const MannerCalculateNutrientsService = require("../vendors/manner/calculate-nutrients/calculate-nutrients.service");
const RB209ArableService = require("../vendors/rb209/arable/arable.service");
const {
  RB209RecommendationService,
} = require("../vendors/rb209/recommendation/recommendation.service");
const {
  RecommendationCommentEntity,
} = require("../db/entity/recommendation-comment.entity");
const { FieldEntity } = require("../db/entity/field.entity");
const { FarmEntity } = require("../db/entity/farm.entity");
const {
  CropTypeLinkingEntity,
} = require("../db/entity/crop-type-linking.entity");
const { SoilAnalysisEntity } = require("../db/entity/soil-analysis.entity");
const { RecommendationEntity } = require("../db/entity/recommendation.entity");
const RB209FieldService = require("../vendors/rb209/field/field.service");
const MannerManureTypesService = require("../vendors/manner/manure-types/manure-types.service");
const { LessThanOrEqual, Between, Not, In } = require("typeorm");
const { SnsAnalysesEntity } = require("../db/entity/sns-analysis.entity");
const { PKBalanceEntity } = require("../db/entity/pk-balance.entity");
const {
  FertiliserManuresEntity,
} = require("../db/entity/fertiliser-manures.entity");
const { SoilTypeSoilTextureEntity } = require("../db/entity/soil-type-soil-texture.entity");
const { CountryEntity } = require("../db/entity/country.entity");
const RB209SoilService = require("../vendors/rb209/soil/soil.service");
const { GrassGrowthService } = require("../grass-growth-plan/grass-growth-plan.service");
const { ExcessRainfallsEntity } = require("../db/entity/excess-rainfalls.entity");
const { CropTypeMapper } = require("../constants/crop-type-mapper");
const { CalculateMannerOutputService } = require("../shared/calculate-manner-output-service");
const { CalculateGrassHistoryAndPreviousGrass } = require("../shared/calculate-previous-grass-id.service");
const { CalculateTotalAvailableNForNextYear } = require("../shared/calculate-next-year-available-n");
const { CalculateNextDefoliationService } = require("../shared/calculate-next-defoliation-totalN");
const { CalculatePKBalanceOther } = require("../shared/calculate-pk-balance-other");
const { WarningMessagesEntity } = require("../db/entity/warning-message.entity");
const { CreateOrUpdateWarningMessage } = require("../shared/create-update-warning-messages.service");
const { WarningCodesMapper } = require("../constants/warning-codes-mapper");
const { CalculatePreviousCropService } = require("../shared/previous-year-crop-service");
const { ManureTypeMapper } = require("../constants/manure-type-mapper");
const { normalizeDateWithTime } = require("../shared/dataValidate");
const { JOINS } = require("../constants/joins-mapper");
const { ProcessFutureManuresForWarnings } = require("../shared/process-future-warning-calculations-service");
const { GenerateRecommendations } = require("../shared/generate-recomendations-service");
const { UpdatingFutureRecommendations } = require("../shared/updating-future-recommendations-service");
class OrganicManureService extends BaseService {
  constructor() {
    super(OrganicManureEntity);
    this.repository = AppDataSource.getRepository(OrganicManureEntity);
    this.cropRepository = AppDataSource.getRepository(CropEntity);
    this.managementPeriodRepository = AppDataSource.getRepository(
      ManagementPeriodEntity,
    );
    this.farmManureTypeRepository =
      AppDataSource.getRepository(FarmManureTypeEntity);
    this.manureTypeRepository = AppDataSource.getRepository(ManureTypeEntity);
    this.MannerCalculateNutrientsService =
      new MannerCalculateNutrientsService();
    this.rB209ArableService = new RB209ArableService();
    this.rB209RecommendationService = new RB209RecommendationService();
    this.RB209SoilService = new RB209SoilService();
    this.CalculateMannerOutput = new CalculateMannerOutputService();
    this.calculateGrassId = new CalculateGrassHistoryAndPreviousGrass();
    this.CalculateTotalAvailableNForPreviousYear =
      new CalculateTotalAvailableNForNextYear();
    this.CalculateNextDefoliationService =
      new CalculateNextDefoliationService();
    this.recommendationCommentRepository = AppDataSource.getRepository(
      RecommendationCommentEntity,
    );
    this.fieldRepository = AppDataSource.getRepository(FieldEntity);
    this.farmRepository = AppDataSource.getRepository(FarmEntity);
    this.CropTypeLinkingRepository = AppDataSource.getRepository(
      CropTypeLinkingEntity,
    );
    this.soilAnalysisRepository =
      AppDataSource.getRepository(SoilAnalysisEntity);
    this.RecommendationRepository =
      AppDataSource.getRepository(RecommendationEntity);
    this.RB209FieldService = new RB209FieldService();
    this.MannerManureTypesService = new MannerManureTypesService();
    this.snsAnalysisRepository = AppDataSource.getRepository(SnsAnalysesEntity);
    this.pkBalanceRepository = AppDataSource.getRepository(PKBalanceEntity);
    this.fertiliserRepository = AppDataSource.getRepository(
      FertiliserManuresEntity,
    );
    this.soilTypeTextureRepository = AppDataSource.getRepository(
      SoilTypeSoilTextureEntity,
    );
    this.countryRepository = AppDataSource.getRepository(CountryEntity);
    this.grassGrowthClass = new GrassGrowthService();
    this.excessRainfallRepository = AppDataSource.getRepository(
      ExcessRainfallsEntity,
    );
    this.CalculatePKBalanceOther = new CalculatePKBalanceOther();
    this.CreateOrUpdateWarningMessage = new CreateOrUpdateWarningMessage();
    this.CreateOrUpdateWarningMessage = new CreateOrUpdateWarningMessage();
    this.CalculatePreviousCropService = new CalculatePreviousCropService();
    this.ProcessFutureManuresForWarnings =
      new ProcessFutureManuresForWarnings();
    this.generateRecommendations = new GenerateRecommendations();
    this.updatingFutureRecommendations = new UpdatingFutureRecommendations();
      
  }

  async getTotalNitrogenByManagementPeriod(
    managementPeriodID,
    fromDate,
    toDate,
    confirm,
    organicManureID,
  ) {
    // Ensure fromDate starts at 00:00:00 and toDate ends at 23:59:59
    const fromDateFormatted = new Date(fromDate);
    fromDateFormatted.setHours(0, 0, 0, 0);

    const toDateFormatted = new Date(toDate);
    toDateFormatted.setHours(23, 59, 59, 999);

    const query = this.repository
      .createQueryBuilder("O") // O = OrganicManures
      .select("SUM(O.N * O.ApplicationRate)", "totalN")
      .where("O.ManagementPeriodID = :managementPeriodID", {
        managementPeriodID,
      })
      .andWhere("O.ApplicationDate BETWEEN :fromDate AND :toDate", {
        fromDate: fromDateFormatted,
        toDate: toDateFormatted,
      })
      .andWhere("O.Confirm = :confirm", { confirm });

    if (organicManureID != null) {
      query.andWhere("O.ID != :organicManureID", {
        organicManureID,
      });
    }

    const result = await query.getRawOne();
    return result?.totalN ?? 0;
  }
  async getTotalNitrogenByCropID(
    cropID,
    fromDate,
    toDate,
    confirm,
    organicManureID,
  ) {
    const START_OF_DAY = {
      HOUR: 0,
      MINUTE: 0,
      SECOND: 0,
      MILLISECOND: 0,
    };

    const END_OF_DAY = {
      HOUR: 23,
      MINUTE: 59,
      SECOND: 59,
      MILLISECOND: 999,
    };

    const fromDateFormatted = normalizeDateWithTime(fromDate, START_OF_DAY);
    const toDateFormatted = normalizeDateWithTime(toDate, END_OF_DAY);
    const query = this.repository
      .createQueryBuilder("O") // O = OrganicManures
      .select("SUM(O.N * O.ApplicationRate)", "totalN")
      .innerJoin(
        "ManagementPeriods",
        "M",
        JOINS.ORGANIC_MANURE_TO_MANAGEMENT_PERIOD,
      )
      .where("M.CropID = :cropID", { cropID })
      .andWhere("O.ApplicationDate BETWEEN :fromDate AND :toDate", {
        fromDate: fromDateFormatted,
        toDate: toDateFormatted,
      })
      .andWhere("O.Confirm = :confirm", { confirm });

    if (organicManureID != null) {
      query.andWhere("O.ID != :organicManureID", { organicManureID });
    }

    const result = await query.getRawOne();
    return Number(result?.totalN ?? 0);
  }

  async getTotalNitrogen(fieldId, fromDate, toDate, confirm, organicManureID) {
    // Ensure fromDate starts at 00:00:00 and toDate ends at 23:59:59
    const START_OF_DAY = {
      HOUR: 0,
      MINUTE: 0,
      SECOND: 0,
      MILLISECOND: 0,
    };

    const END_OF_DAY = {
      HOUR: 23,
      MINUTE: 59,
      SECOND: 59,
      MILLISECOND: 999,
    };
    const fromDateFormatted = new Date(fromDate);
    fromDateFormatted.setHours(
      START_OF_DAY.HOUR,
      START_OF_DAY.MINUTE,
      START_OF_DAY.SECOND,
      START_OF_DAY.MILLISECOND,
    );

    const toDateFormatted = new Date(toDate);
    toDateFormatted.setHours(
      END_OF_DAY.HOUR,
      END_OF_DAY.MINUTE,
      END_OF_DAY.SECOND,
      END_OF_DAY.MILLISECOND,
    );

    const query = this.repository
      .createQueryBuilder("O") // O = OrganicManures
      .select("SUM(O.N * O.ApplicationRate)", "totalN")
      .innerJoin(
        "ManagementPeriods",
        "M",
        JOINS.ORGANIC_MANURE_TO_MANAGEMENT_PERIOD,
      )
      .innerJoin("Crops", "C", "M.CropID = C.ID")
      .where("C.FieldID = :fieldId", { fieldId }) // note lowercase 'fieldId'
      .andWhere("O.ApplicationDate BETWEEN :fromDate AND :toDate", {
        fromDate: fromDateFormatted,
        toDate: toDateFormatted,
      })
      .andWhere("O.Confirm = :confirm", { confirm });
    if (organicManureID != null) {
      query.andWhere("O.ID != :organicManureID", {
        organicManureID,
      });
    }
    const result = await query.getRawOne();

    return result.totalN;
  }

  async getTotalNitrogenIfIsGreenFoodCompost(
    fieldId,
    fromDate,
    toDate,
    confirm,
    isGreenFoodCompost,
    organicManureID,
  ) {
    // Ensure fromDate starts at 00:00:00 and toDate ends at 23:59:59
    const fromDateFormatted = new Date(fromDate);
    fromDateFormatted.setHours(0, 0, 0, 0); // Set time to start of the day

    const toDateFormatted = new Date(toDate);
    toDateFormatted.setHours(23, 59, 59, 999); // Set time to end of the day

    // Add additional filtering for ManureTypeID when isGreenFoodCompost is true
    const query = this.repository
      .createQueryBuilder("O") // O = OrganicManures
      .select("SUM(O.N * O.ApplicationRate)", "totalN")
      .innerJoin(
        "ManagementPeriods",
        "M",
        JOINS.ORGANIC_MANURE_TO_MANAGEMENT_PERIOD,
      )
      .innerJoin("Crops", "C", "M.CropID = C.ID")
      .where("C.FieldID = :fieldId", { fieldId }) // note lowercase 'fieldId'
      .andWhere("O.ApplicationDate BETWEEN :fromDate AND :toDate", {
        fromDate: fromDateFormatted,
        toDate: toDateFormatted,
      })
      .andWhere("O.Confirm = :confirm", { confirm });
    if (isGreenFoodCompost) {
      query.andWhere("O.ManureTypeID IN (:...manureTypeIDs)", {
        manureTypeIDs: [24, 32],
      });
    }
    if (!isGreenFoodCompost) {
      query.andWhere("O.ManureTypeID NOT IN (:...manureTypeIDs)", {
        manureTypeIDs: [24, 32],
      });
    }
    if (organicManureID != null) {
      query.andWhere("O.ID != :organicManureID", {
        organicManureID,
      });
    }
    console.log("organicManureID", organicManureID);
    const result = await query.getRawOne();
    console.log("organicManureID", result.totalN);
    return result.totalN;
  }

  async getManureTypeIdsbyFieldAndYear(fieldId, year, confirm) {
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

  async getManureTypeIdsByManagementPeriod(managementPeriodID) {
    const rows = await this.repository.find({
      select: ["ManureTypeID"],
      where: {
        ManagementPeriodID: managementPeriodID,
      },
    });

    return rows.map((r) => r.ManureTypeID);
  }

  async getFirstCropData(transactionalManager, FieldID, Year) {
    const data = await transactionalManager.findOne(CropEntity, {
      where: {
        FieldID: FieldID,
        Year: Year,
        Confirm: false, // Or 0, depending on your schema
        CropOrder: 1,
      },
    });

    return data;
  }

  async getManagementPeriodId(id) {
    const data = await this.managementPeriodRepository.findOne({
      where: {
        CropID: id,
      },
      select: ["ID"], // Only select the ID column
    });

    return data?.ID; // Return only the ID field
  }

 

  async getPKBalanceData(field, year, allPKBalanceData) {
    try {
      // Find the data by filtering allPKBalanceData
      const pkBalanceData = allPKBalanceData.find(
        (data) => data.FieldID === field.ID && data.Year === year,
      );

      return pkBalanceData || null; // Return the found data or null if not found
    } catch (error) {
      console.error("Error fetching PK Balance data:", error);
      throw error; // Re-throw the error or handle it as needed
    }
  }
 

  async checkIfManagementPeriodExistsInOrganicManure(
    ManagementPeriodID,
    organicManureAllData,
  ) {
    const managementPeriodExists = organicManureAllData.some(
      (data) => data.ManagementPeriodID === ManagementPeriodID,
    );

    if (managementPeriodExists) {
      return true;
    } else {
      return false;
    }
  }


  async saveOrganicManureForOtherCropType(
    organicManureData,
    mannerOutputs,
    transactionalManager,
    userId,
    organicManures,
  ) {
    const savedOrganicManure = await transactionalManager.save(
      OrganicManureEntity,
      this.repository.create({
        ...organicManureData.OrganicManure,
        ...(organicManureData.OrganicManure.ID == 0 ? { ID: null } : {}),
        CreatedByID: userId,
        CreatedOn: new Date(),
      }),
    );
    organicManures.push(savedOrganicManure);
  }
 
  async createOrganicManuresWithFarmManureType(request, body, userId) {
    return await AppDataSource.transaction(async (transactionalManager) => {
      let savedFarmManureType;
      let farmManureTypeData;
      const organicManures = [];
      const organicManureAllData = await this.repository.find();
      const cropPlanAllData = await this.cropRepository.find({
        select: ["ID", "FieldID", "Year"],
      });
      const managementPeriodAllData =
        await this.managementPeriodRepository.find();
      const soilAnalysisAllData = await this.soilAnalysisRepository.find();
      const fertiliserAllData = await this.fertiliserRepository.find();

      for (const organicManureData of body.OrganicManures) {
        const { OrganicManure } = organicManureData;
        if (
          OrganicManure.NH4N + OrganicManure.NO3N + OrganicManure.UricAcid >
          OrganicManure.N
        ) {
          console.log(
            "NH4N + NO3N + UricAcid must be less than or equal to TotalN",
          );
        }
        // Convert the Date object to YYYY-MM-DD string format
        const applicationDateObj = new Date(OrganicManure.ApplicationDate);

        // Convert the Date object to YYYY-MM-DD format
        const applicationDate = applicationDateObj.toISOString().split("T")[0]; // returns a Date object
        const endOfDrainageDateObj = new Date(OrganicManure.EndOfDrain);
        const endOfDrainageDate = endOfDrainageDateObj
          .toISOString()
          .split("T")[0];
     
        const managementPeriodData =
          await this.managementPeriodRepository.findOneBy({
            ID: OrganicManure.ManagementPeriodID,
          });

        const cropData = await this.cropRepository.findOneBy({
          ID: managementPeriodData.CropID
        });
        const fieldData = await this.fieldRepository.findOneBy({
          ID: cropData.FieldID
        });
        const farmData = await this.farmRepository.findOneBy({
          ID: organicManureData.FarmID
        });
        
        const soilAnalsisData = soilAnalysisAllData?.filter((soilAnalyses) => {
          return soilAnalyses.FieldID === cropData.FieldID;
        });
       
        let isSoilAnalysisHavePAndK = false;
        if (soilAnalsisData) {
          isSoilAnalysisHavePAndK = soilAnalsisData.some(
            (item) =>
              item.PhosphorusIndex !== null || item.PotassiumIndex !== null,
          )
            ? true
            : false;
        }
        let mannerOutputs = null;
        mannerOutputs = await this.CalculateMannerOutput.calculateMannerOutputForOrganicManure(
            cropData,
            OrganicManure,
            farmData,
            fieldData,
            transactionalManager,
            request,
          );

        // Call the new helper function to create mannerOutputReq

        let isNextYearPlanExist = false;
        let isNextYearOrganicManureExist = false;
        let isNextYearFertiliserExist = false;
        if (isSoilAnalysisHavePAndK) {
          const cropPlanForNextYear = cropPlanAllData?.filter((cropPlan) => {
            return (
              cropPlan.FieldID === fieldData.ID && cropPlan.Year > cropData.Year
            );
          });


          if (cropPlanForNextYear.length > 0) {
            isNextYearPlanExist = true;
            for (const crop of cropPlanForNextYear) {
              console.log("CropID", crop.ID);
              const managementPeriodDataId = managementPeriodAllData
                ?.filter((manData) => manData.CropID === crop.ID)
                .map((manData) => manData.ID);
              console.log("managementPeriodDataId", managementPeriodDataId);
              if (managementPeriodDataId.length > 0) {
                const filterOrganicManure = organicManureAllData?.filter(
                  (organicData) =>
                    organicData.ManagementPeriodID ===
                    managementPeriodDataId[0],
                );

                console.log("organicManureId", filterOrganicManure);
                const filterFertiliserData = fertiliserAllData?.filter(
                  (fertData) =>
                    fertData.ManagementPeriodID === managementPeriodDataId[0],
                );
                console.log("fertiliserId", filterFertiliserData);

                if (
                  filterOrganicManure != null &&
                  filterOrganicManure.length > 0
                ) {
                  console.log("filterOrganicManure", filterFertiliserData);
                  isNextYearOrganicManureExist = true;
                }
                if (
                  filterFertiliserData != null &&
                  filterFertiliserData.length > 0
                ) {
                  console.log("filterOrganicManure", filterFertiliserData);
                  isNextYearFertiliserExist = true;
                }
              }
            }
          }
        }

        const previousCrop =
          await this.CalculatePreviousCropService.findPreviousCrop(
            fieldData.ID,
            cropData.Year,
            transactionalManager,
          );

        if (
          cropData.CropTypeID === CropTypeMapper.OTHER ||
          cropData.IsBasePlan ||
          !previousCrop
        ) {
          await this.saveOrganicManureForOtherCropType(
            organicManureData,
            mannerOutputs,
            transactionalManager,
            userId,
            organicManures
          );

             await this.generateRecommendations.generateRecommendations(
               fieldData.ID,
               cropData.Year,
               OrganicManure,
               transactionalManager,
               request,
               userId
             );
          
          const nextAvailableCrop = await this.cropRepository.findOne({
            where: {
              FieldID: cropData.FieldID,
              Year: MoreThan(cropData.Year),
            },
            order: { Year: "ASC" },
          });

          if (nextAvailableCrop) {
            this.updatingFutureRecommendations.updateRecommendationsForField(
              cropData.FieldID,
              nextAvailableCrop.Year,
              request,
              userId,
            );
          }
        } else {
        

          const savedOrganicManure = await transactionalManager.save(
            OrganicManureEntity,
            this.repository.create({
              ...organicManureData.OrganicManure,
              CreatedByID: userId,
              CreatedOn: new Date(),
            }),
          );
          if (
            organicManureData.WarningMessages &&
            organicManureData.WarningMessages.length > 0
          ) {
            const warningMessagesToSave = organicManureData.WarningMessages.map(
              (wm) =>
                transactionalManager.create(WarningMessagesEntity, {
                  ...wm,
                  JoiningID:
                    wm.WarningCodeID == WarningCodesMapper.NMAXLIMIT
                      ? cropData.FieldID
                      : savedOrganicManure.ID,
                  CreatedByID: userId,
                  CreatedOn: new Date(),
                }),
            );

            await transactionalManager.save(
              WarningMessagesEntity,
              warningMessagesToSave,
            );
          }

          organicManures.push(savedOrganicManure);

         await this.generateRecommendations.generateRecommendations(
           fieldData.ID,
           cropData.Year,
           OrganicManure,
           transactionalManager,
           request,
           userId
         );

        
            if (
              isSoilAnalysisHavePAndK && (
                isNextYearPlanExist  ||
                  isNextYearOrganicManureExist  ||
                  isNextYearFertiliserExist 
              )
            ) {
              // UpdateRecommendation
              this.updatingFutureRecommendations.updateRecommendationsForField(
                  cropData?.FieldID,
                  cropData?.Year,
                  request,
                  userId,
                )
            } 
          
          const isCurrentOrganicManure = true,
            isCurrentFertiliser = false;
          this.ProcessFutureManuresForWarnings.ProcessFutureManures(
            fieldData.ID,
            savedOrganicManure.ApplicationDate,
            isCurrentOrganicManure,
            isCurrentFertiliser,
            savedOrganicManure.ID,
            userId,
          );
        }

        if (organicManureData.SaveDefaultForFarm) {
          farmManureTypeData = {
            FarmID: organicManureData.FarmID,
            ManureTypeID: OrganicManure.ManureTypeID,
            ManureTypeName: OrganicManure.ManureTypeName,
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
      }
      if (farmManureTypeData) {
        const existingFarmManureType =
          await this.farmManureTypeRepository.findOne({
            where: {
              FarmID: farmManureTypeData.FarmID,
              ManureTypeID: farmManureTypeData.ManureTypeID,
              ManureTypeName: farmManureTypeData.ManureTypeName,
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
            FarmManureTypeEntity,
            this.farmManureTypeRepository.create({
              ...farmManureTypeData,
              CreatedByID: userId,
              CreatedOn: new Date(),
            }),
          );
        }
      }

      return {
        OrganicManures: organicManures,
        FarmManureType: savedFarmManureType,
      };
    });
  }

  async checkManureExists(
    managementPeriodID,
    dateFrom,
    dateTo,
    confirm,
    organicManureID,
    isSlurryOnly,
    request,
  ) {
    try {
      // Fetch all manure types from the API
      const allManureTypes = await this.MannerManureTypesService.getData(
        "/manure-types",
        request,
      );

      if (!allManureTypes?.data || allManureTypes.data.length === 0) {
        // Log a error if no manure types are returned
        console.error("No manure types returned from the Manner API");
      }

      // Filter manure types: IsLiquid is true OR ManureTypeID = 8 (for Poultry manure)
      const SlurryOrRanManureTypes = allManureTypes.data.filter((manure) =>
        isSlurryOnly
          ? manure.isSlurry === true
          : manure.highReadilyAvailableNitrogen === true,
      );

      // Extract manureTypeIds from the filtered result
      const manureTypeIds = SlurryOrRanManureTypes.map((manure) => manure.id);

      // If no valid manureTypeIds, return false
      if (!manureTypeIds || manureTypeIds.length === 0) {
        return false; // No valid manure types found
      }

      // Query OrganicManures for these manureTypeIds within the date range
      const query = this.repository
        .createQueryBuilder("organicManure")
        .where("organicManure.ManureTypeID IN (:...manureTypeIds)", {
          manureTypeIds,
        })
        .andWhere(
          "organicManure.ApplicationDate BETWEEN :dateFrom AND :dateTo",
          {
            dateFrom,
            dateTo,
          },
        )
        .andWhere("organicManure.ManagementPeriodID = :managementPeriodID", {
          managementPeriodID,
        })
        .andWhere("organicManure.Confirm = :confirm", { confirm });

      if (organicManureID != null) {
        query.andWhere("organicManure.ID != :organicManureID", {
          organicManureID,
        });
      }

      // Execute query
      const manureTypeExists = await query.getCount();

      // Return true if any matching records are found
      return manureTypeExists > 0;
    } catch (error) {
      // Log the error for debugging purposes
      console.error("Error checking for manure existence:", error.message);

      // You can choose to throw the error or handle it silently
      throw new Error(
        "Failed to check manure existence due to an internal error",
      );
    }
  }

  async getP205AndK20fromfertiliser(managementPeriodId) {
    let sumOfP205 = 0;
    let sumOfK20 = 0;
    const fertiliserData = await this.fertiliserRepository.find({
      where: {
        ManagementPeriodID: managementPeriodId,
      },
      select: {
        P2O5: true,
        K2O: true,
      },
    });

    if (fertiliserData && fertiliserData.length > 0) {
      for (const fertiliser of fertiliserData) {
        sumOfP205 += fertiliser.P2O5 || 0;
        sumOfK20 += fertiliser.K2O || 0;
      }
    }
    return { p205: sumOfP205, k20: sumOfK20 };
  }
  async deleteOrganicManure(organicManureId, userId, request) {
    return await AppDataSource.transaction(async (transactionalManager) => {
      // Check if the Organic Manure exists
      const organicManureToDelete = await this.repository.findOneBy({
        ID: organicManureId,
      });

      // If the organicManure does not exist, throw a not found error
      if (organicManureToDelete == null) {
        console.log(`Organic Manure with ID ${organicManureId} not found`);
      }
      const managementPeriod = await this.managementPeriodRepository.findOne({
        where: { ID: organicManureToDelete.ManagementPeriodID },
        select: ["CropID"],
      });

      // If the managementPeriod does not exist, throw a not found error
      if (managementPeriod == null) {
        console.log(
          `managementPeriod with ID ${organicManureToDelete.ManagementPeriodID} not found`,
        );
      }
      const crop = await this.cropRepository.findOne({
        where: { ID: managementPeriod.CropID },
      });

      // If the crop does not exist, throw a not found error
      if (crop == null) {
        console.log(`crop with ID ${managementPeriod.CropID} not found`);
      }

      try {
        // Call the stored procedure to delete the organicManureId and related entities
        const storedProcedure =
          "EXEC [spOrganicManures_DeleteOrganicManures] @OrganicManureID = @0";
        await transactionalManager.query(storedProcedure, [organicManureId]);
       const newOrganicManure = null;
        await this.generateRecommendations.generateRecommendations(
          crop.FieldID,
          crop.Year,
          newOrganicManure, 
          transactionalManager,
          request,
          userId
        );
        // Check if there are any records in the repository for crop.FieldID with a year greater than crop.Year
        const nextAvailableCrop = await this.cropRepository.findOne({
          where: {
            FieldID: crop.FieldID,
            Year: MoreThan(crop.Year), // Find the next available year greater than the current crop.Year
          },
          order: {
            Year: "ASC", // Ensure we get the next immediate year
          },
        });
        if (nextAvailableCrop) {
          this.updatingFutureRecommendations.updateRecommendationsForField(
              crop.FieldID,
              nextAvailableCrop.Year,
              request,
              userId
            )
        }

        return { affectedRows: 1 }; // Success response
      } catch (error) {
        // Log the error and throw an internal server error
        console.error("Error deleting organicManure:", error);
      }
    });
  }
 

  async updateOrganicManure(updatedOrganicManureData, userId, request) {
    return await AppDataSource.transaction(async (transactionalManager) => {
      const updatedOrganicManures = [];
      let savedFarmManureType = null;

      for (const manureEntry of updatedOrganicManureData) {
        const {
          OrganicManure,
          WarningMessages,
          FarmID,
          FieldTypeID,
          SaveDefaultForFarm,
        } = manureEntry;

        const { ID, CreatedByID, CreatedOn, ...updatedData } = OrganicManure;
        // 🔄 Update recommendations
        const managementPeriod = await transactionalManager.findOne(
          ManagementPeriodEntity,
          {
            where: { ID: OrganicManure.ManagementPeriodID },
          },
        );

        const crop = await transactionalManager.findOne(CropEntity, {
          where: { ID: managementPeriod?.CropID },
        });

        const fieldData = await transactionalManager.findOne(FieldEntity, {
          where: { ID: crop?.FieldID },
        });

        let manureBody = null,
          manureRequestBody = null,
          mannerOutput = null;
        // Fetch existing OrganicManure from DB
        const existingOrganicManure = await transactionalManager.findOne(
          OrganicManureEntity,
          { where: { ID } },
        );

        let dataToUpdate;

        {
          dataToUpdate = {
            ...updatedData,
            ModifiedByID: userId,
            ModifiedOn: new Date(),
            ManagementPeriodID: OrganicManure.ManagementPeriodID,
          };
        }

        await transactionalManager.update(
          OrganicManureEntity,
          ID,
          dataToUpdate,
        );

        await this.CreateOrUpdateWarningMessage.syncWarningMessages(
          OrganicManure.ManagementPeriodID,
          OrganicManure,
          WarningMessages,
          transactionalManager,
          userId,
        );

        // Fetch the updated version to return
        const organicManure = await transactionalManager.findOne(
          OrganicManureEntity,
          { where: { ID } },
        );

        if (organicManure) {
          updatedOrganicManures.push(organicManure);
        }

        // ✅ Update FarmManureType if SaveDefaultForFarm is true (no creation)
        if (SaveDefaultForFarm) {
          const farmManureTypeData = {
            FarmID,
            ManureTypeID: OrganicManure.ManureTypeID,
            ManureTypeName: OrganicManure.ManureTypeName,
            FieldTypeID,
            TotalN: OrganicManure.N,
            DryMatter: OrganicManure.DryMatterPercent,
            NH4N: OrganicManure.NH4N,
            Uric: OrganicManure.UricAcid,
            NO3N: OrganicManure.NO3N,
            P2O5: OrganicManure.P2O5,
            SO3: OrganicManure.SO3,
            K2O: OrganicManure.K2O,
            MgO: OrganicManure.MgO,
          };

          const existingFarmManureType =
            await this.farmManureTypeRepository.findOne({
              where: {
                FarmID: farmManureTypeData.FarmID,
                ManureTypeID: farmManureTypeData.ManureTypeID,
                ManureTypeName: farmManureTypeData.ManureTypeName,
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
              FarmManureTypeEntity,
              this.farmManureTypeRepository.create({
                ...farmManureTypeData,
                CreatedByID: userId,
                CreatedOn: new Date(),
              }),
            );
          }
        }
        const newOrganicManure= null
        await this.generateRecommendations.generateRecommendations(
          crop.FieldID,
          crop.Year,
          newOrganicManure,
          transactionalManager,
          request,
          userId
        );

        const nextAvailableCrop = await this.cropRepository.findOne({
          where: {
            FieldID: crop.FieldID,
            Year: MoreThan(crop.Year),
          },
          order: { Year: "ASC" },
        });

        if (nextAvailableCrop) {
          this.updatingFutureRecommendations.updateRecommendationsForField(
              crop.FieldID,
              nextAvailableCrop.Year,
              request,
              userId,
            )
            .then((res) => {
              if (res === undefined) {
                console.log(
                  "updateRecommendationAndOrganicManure returned undefined",
                );
              } else {
                console.log(
                  "updateRecommendationAndOrganicManure result:",
                  res,
                );
              }
            })
            .catch((error) => {
              console.error(
                "Error updating recommendation and organic manure:",
                error,
              );
            });
        }
        const isCurrentOrganicManure = true,
          isCurrentFertiliser = false;
        this.ProcessFutureManuresForWarnings.ProcessFutureManures(
          fieldData.ID,
          OrganicManure.ApplicationDate,
          isCurrentOrganicManure,
          isCurrentFertiliser,
          ID,
          userId,
        );
      }

      return {
        OrganicManure: updatedOrganicManures,
        FarmManureType: savedFarmManureType,
      };
    });
  }

  async getOrganicManureByFarmIdAndYear(organicManureId, farmId, harvestYear) {
    try {
      const storedProcedure =
        "EXEC dbo.spOrganicManures_GetByFarmIdAndYear @farmId = @0, @harvestYear = @1";
      const organicManureList = await this.executeQuery(storedProcedure, [
        farmId,
        harvestYear,
      ]);

      const organicManure = await this.repository.findOne({
        where: { ID: organicManureId },
      });

      const records =
        organicManureList.length > 0 && organicManure != null
          ? organicManureList.filter((item) => {
              const itemDate = new Date(item?.ApplicationDate);
              const organicDate = new Date(organicManure?.ApplicationDate);
              const isMatching =
                itemDate.getTime() === organicDate.getTime() &&
                item?.ManureTypeID === organicManure?.ManureTypeID &&
                item?.Nitrogen === organicManure?.N &&
                item?.P2O5 === organicManure?.P2O5 &&
                item?.SO3 === organicManure?.SO3 &&
                item?.K2O === organicManure?.K2O &&
                item?.MgO === organicManure?.MgO &&
                item?.UricAcid === organicManure?.UricAcid &&
                item?.DryMatterPercent === organicManure?.DryMatterPercent &&
                item?.NH4N === organicManure?.NH4N &&
                item?.NO3N === organicManure?.NO3N;

              return isMatching;
            })
          : null;

      return records;
    } catch (error) {
      console.error("Error occurred while fetching organic records:", error);
      return null;
    }
  }
  async getTotalAvailableNitrogenByManagementPeriodID(managementPeriodID) {
    const organicManuresResult = await this.repository
      .createQueryBuilder("OrganicManures")
      .select(
        "SUM(COALESCE(OrganicManures.AvailableNForNMax, OrganicManures.AvailableN))",
        "totalN",
      )
      .where("OrganicManures.ManagementPeriodID = :managementPeriodID", {
        managementPeriodID,
      })
      .andWhere(
        "organicManures.ManureTypeID NOT IN (:...excludedManureTypes)",
        {
          excludedManureTypes: [
            ManureTypeMapper.StrawMulch,
            ManureTypeMapper.PaperCrumbleBiologicallyTreated,
            ManureTypeMapper.PaperCrumbleChemicallyPhysciallyTreated,
          ],
        },
      ); //exclude StrawMulch, PaperCrumbleChemicallyPhysciallyTreated,PaperCrumbleBiologicallyTreated
    const organicResult = await organicManuresResult.getRawOne();
    return organicResult.totalN;
  }
}
module.exports = { OrganicManureService }
