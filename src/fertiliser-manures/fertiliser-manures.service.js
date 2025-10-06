const { AppDataSource } = require("../db/data-source");
const {
  FertiliserManuresEntity,
} = require("../db/entity/fertiliser-manures.entity");
const { OrganicManureEntity } = require("../db/entity/organic-manure.entity");
const { BaseService } = require("../base/base.service");
const { RecommendationEntity } = require("../db/entity/recommendation.entity");
const { FieldEntity } = require("../db/entity/field.entity");
const { CropEntity } = require("../db/entity/crop.entity");
const {
  ManagementPeriodEntity,
} = require("../db/entity/management-period.entity");
const { PKBalanceEntity } = require("../db/entity/pk-balance.entity");
const {
  UpdateRecommendation,
} = require("../shared/updateRecommendation.service");
const { SoilAnalysisEntity } = require("../db/entity/soil-analysis.entity");
const { MoreThan } = require("typeorm");
const {
  UpdateRecommendationChanges,
} = require("../shared/updateRecommendationsChanges");
const { CropTypeMapper } = require("../constants/crop-type-mapper");
const { CountryEntity } = require("../db/entity/country.entity");
const { FarmEntity } = require("../db/entity/farm.entity");
const { HandleSoilAnalysisService } = require("../shared/handle-soil-analysis");
const { CalculatePKBalanceOther } = require("../shared/calculate-pk-balance-other");
const { WarningMessagesEntity } = require("../db/entity/warning-message.entity");

class FertiliserManuresService extends BaseService {
  constructor() {
    super(FertiliserManuresEntity);
    this.repository = AppDataSource.getRepository(FertiliserManuresEntity);
    this.warningMessageRepository = AppDataSource.getRepository(WarningMessagesEntity);
    this.organicManureRepository =
      AppDataSource.getRepository(OrganicManureEntity);
    this.RecommendationRepository =
      AppDataSource.getRepository(RecommendationEntity);
    this.fieldRepository = AppDataSource.getRepository(FieldEntity);
    this.cropRepository = AppDataSource.getRepository(CropEntity);
    this.managementPeriodRepository = AppDataSource.getRepository(
      ManagementPeriodEntity
    );
    this.pkBalanceRepository = AppDataSource.getRepository(PKBalanceEntity);
    this.UpdateRecommendation = new UpdateRecommendation();
    this.UpdateRecommendationChanges = new UpdateRecommendationChanges();
    this.soilAnalysisRepository =
      AppDataSource.getRepository(SoilAnalysisEntity);
    this.farmRepository = AppDataSource.getRepository(FarmEntity);
    this.HandleSoilAnalysisService = new HandleSoilAnalysisService();
    this.CalculatePKBalanceOther = new CalculatePKBalanceOther();
    
      
  }
  async getFertiliserManureNitrogenSum(
    fieldId,
    fromDate,
    toDate,
    confirm,
    fertiliserId
  ) {
    // Ensure fromDate starts at 00:00:00 and toDate ends at 23:59:59
    const fromDateFormatted = new Date(fromDate);
    fromDateFormatted.setHours(0, 0, 0, 0); // Set time to start of the day

    const toDateFormatted = new Date(toDate);
    toDateFormatted.setHours(23, 59, 59, 999); // Set time to end of the day

    // const queryBuilder = this.repository
    //   .createQueryBuilder("fertiliserManures")
    //   .select(
    //     "SUM(fertiliserManures.N * fertiliserManures.ApplicationRate)",
    //     "totalN"
    //   )
    //   .where("fertiliserManures.ManagementPeriodID = :managementPeriodID", {
    //     managementPeriodID,
    //   })
    //   .andWhere(
    //     "fertiliserManures.ApplicationDate BETWEEN :fromDate AND :toDate",
    //     { fromDate: fromDateFormatted, toDate: toDateFormatted }
    //   )
    //   .andWhere("fertiliserManures.Confirm = :confirm", { confirm });
    const queryBuilder = await this.repository
      .createQueryBuilder("F") 
      .select("SUM(F.N * F.ApplicationRate)", "totalN")
      .innerJoin("ManagementPeriods", "M", "F.ManagementPeriodID = M.ID")
      .innerJoin("Crops", "C", "M.CropID = C.ID")
      .where("C.FieldID = :fieldId", { fieldId }) // note lowercase 'fieldId'
      .andWhere("F.ApplicationDate BETWEEN :fromDate AND :toDate", {
        fromDate: fromDateFormatted,
        toDate: toDateFormatted,
      })
      .andWhere("F.Confirm = :confirm", { confirm });

    // Only apply the fertiliserId condition if it's not null or undefined
    if (fertiliserId !== null && fertiliserId !== undefined) {
      queryBuilder.andWhere("F.ID != :fertiliserId", {
        fertiliserId,
      });
    }

    const result = await queryBuilder.getRawOne();
    return result.totalN;
  }

  async getTotalNitrogen(managementPeriodID, confirm, fertiliserID, organicManureID) {
    const fertiliserManuresResult = await this.repository
      .createQueryBuilder("fertiliserManures")
      .select(
        "SUM(fertiliserManures.N * fertiliserManures.ApplicationRate)",
        "totalN"
      )
      .where("fertiliserManures.ManagementPeriodID = :managementPeriodID", {
        managementPeriodID,
      })
      .andWhere("fertiliserManures.Confirm = :confirm", { confirm });

    // const fertiliserManuresResult = await this.repository
    //   .createQueryBuilder("F") // O = OrganicManures
    //   .select("SUM(F.N * F.ApplicationRate)", "totalN")
    //   .innerJoin("ManagementPeriods", "M", "F.ManagementPeriodID = M.ID")
    //   .innerJoin("Crops", "C", "M.CropID = C.ID")
    //   .where("C.FieldID = :fieldId", { fieldId }) // note lowercase 'fieldId'
    //   .andWhere("F.Confirm = :confirm", { confirm });
    // if (fertiliserID !== null && fertiliserID !== undefined) {
    //   fertiliserManuresResult.andWhere("F.ID != :fertiliserID", {
    //     fertiliserID,
    //   });
    // }

    const fertiliserResult = await fertiliserManuresResult.getRawOne();
    console.log("fertiliserResult", fertiliserResult);
    // return result.totalN;
    // .getRawOne();
    const organicManuresResult = await this.organicManureRepository
      .createQueryBuilder("organicManures")
      .select("SUM(organicManures.AvailableNForNMax)", "totalN")
      .where("organicManures.ManagementPeriodID = :managementPeriodID", {
        managementPeriodID,
      })
      .andWhere("organicManures.Confirm = :confirm", { confirm });

    // const organicManuresResult = await this.repository
    //   .createQueryBuilder("O") // O = OrganicManures
    //   .select("SUM(O.AvailableNForNMax)", "totalN")
    //   .innerJoin("ManagementPeriods", "M", "O.ManagementPeriodID = M.ID")
    //   .innerJoin("Crops", "C", "M.CropID = C.ID")
    //   .where("C.FieldID = :fieldId", { fieldId }) // note lowercase 'fieldId'
    //   .andWhere("O.Confirm = :confirm", { confirm });
    if (organicManureID !== null && organicManureID !== undefined) {
      organicManuresResult.andWhere("organicManures.ID != :organicManureID", {
        organicManureID,
      });
    }

    const organicResult = await organicManuresResult.getRawOne();
    console.log("organicResult", organicResult);
    return fertiliserResult.totalN + organicResult.totalN;
  }

  async createFertiliserManures(fertiliserManureData, userId, request) {
    const cropPlanAllData = await this.cropRepository.find();
    const recommandationAllData = await this.RecommendationRepository.find();
    const managementPeriodAllData =
      await this.managementPeriodRepository.find();
    const fieldAllData = await this.fieldRepository.find();
      const fertiliserAllData = await this.repository.find();
   

    return await AppDataSource.transaction(async (transactionalManager) => {
      // const fertiliserManures = fertiliserManureData.map(
      //   ({ ID, WarningMessages, ...rest }) => ({
      //     ...rest,
      //     CreatedByID: userId,
      //     CreatedOn: new Date(),
      //   })
      console.log("fertiliserManureData",fertiliserManureData);
      console.log(
        "fertiliserManureData.FertiliserManure",
        fertiliserManureData.FertiliserManure
      );
    
      // );
  let fertiliserManures =[];
      for (const fertiliser of fertiliserManureData) {
          const fertiliserManure = fertiliser.FertiliserManure;
        // Save fertiliser first
        const savedFertiliser = await transactionalManager.save(
          FertiliserManuresEntity,
          this.repository.create({
            ...fertiliserManure,
            CreatedByID: userId,
            CreatedOn: new Date(),
          })
        );
      fertiliserManures.push(savedFertiliser);
        // Now save its WarningMessages (if any)
        const warningMessage = fertiliser.WarningMessages
        if (warningMessage && warningMessage?.length > 0) {
          const warningMessagesToSave = warningMessage.map((msg) =>
            this.warningMessageRepository.create({
              ...msg,
              JoiningID: savedFertiliser.ID,
              CreatedByID: userId,
              CreatedOn: new Date(),
            })
          );

         const savedWarningMessage = await transactionalManager.save(
            WarningMessagesEntity,
            warningMessagesToSave
          );
          
        }
      }

      const soilAnalysisAllData = await this.soilAnalysisRepository.find();
      const pkBalanceAllData = await this.pkBalanceRepository.find();

    

 

      // const managementPeriodData =
      //   await this.managementPeriodRepository.findOneBy({
      //     ID: fertiliserManureData[0].ManagementPeriodID,
      //   });
      for (const fertManure of fertiliserManures) {
        const fertiliserData = fertiliserAllData.filter((fertData) => {
          return fertData.ManagementPeriodID === fertManure.ManagementPeriodID;
        });
        const managementPeriodData = managementPeriodAllData.filter(
          (manData) => {
            return manData.ID === fertManure.ManagementPeriodID;
          }
        );
        const cropData = cropPlanAllData.filter((cropData) => {
          return cropData.ID === managementPeriodData[0].CropID;
        });

        const fieldData = fieldAllData.filter((fieldData) => {
          return fieldData.ID === cropData[0]?.FieldID;
        });

        const soilAnalsisData = soilAnalysisAllData.filter((soilAnalyses) => {
          return soilAnalyses.FieldID === cropData[0]?.FieldID;
        });
        let isSoilAnalysisHavePAndK = false;
        if (soilAnalsisData.length > 0) {
          isSoilAnalysisHavePAndK = soilAnalsisData.some(
            (item) =>
              item.PhosphorusIndex !== null || item.PotassiumIndex !== null
          )
            ? true
            : false;
        }
        //console.log("isSoilAnalysisHavePAndK", isSoilAnalysisHavePAndK);
        if (isSoilAnalysisHavePAndK) {
          const pkBalanceData = pkBalanceAllData.filter((pkBalance) => {
            return (
              pkBalance.FieldID === fieldData[0]?.ID &&
              pkBalance.Year === cropData[0]?.Year
            );
          });
          // ({
          //   where: { Year: cropData[0].Year, FieldID: fieldData[0].ID },
          // });
          const cropPlanForNextYear = cropPlanAllData.filter((cropPlan) => {
            return (
              cropPlan.FieldID === fieldData[0]?.ID &&
              cropPlan.Year > cropData[0]?.Year
            );
          });
          let isNextYearPlanExist = false;
          let isNextYearFertiliserExist = false;
          if (cropPlanForNextYear && cropPlanForNextYear.length > 0) {
            isNextYearPlanExist = true;
            for (const crop of cropPlanForNextYear) {
              const managementPeriodDataId = managementPeriodAllData
                .filter((manData) => manData.CropID === crop.ID)
                .map((manData) => manData.ID);
              if (managementPeriodDataId.length > 0) {
                const filterFertiliserData = fertiliserAllData.filter(
                  (fertData) =>
                    fertData.ManagementPeriodID ===
                    fertManure.ManagementPeriodID
                );

                if (
                  filterFertiliserData != null &&
                  filterFertiliserData.length > 0
                ) {
                  isNextYearFertiliserExist = true;
                }
              }
            }
          }
          if (
            isNextYearPlanExist == true &&
            isNextYearFertiliserExist == true
          ) {
            //call shreyash's function
            this.UpdateRecommendation.updateRecommendationsForField(
              fieldData[0]?.ID,
              cropData[0]?.Year,
              request,
              userId
            )
              .then((res) => {
                if (res === undefined) {
                  console.log(
                    "updateRecommendationAndOrganicManure returned undefined"
                  );
                } else {
                  console.log(
                    "updateRecommendationAndOrganicManure result:",
                    res
                  );
                }
              })
              .catch((error) => {
                console.error(
                  "Error updating recommendation and organic manure:",
                  error
                );
              });
          } else {
            if (pkBalanceData.length > 0) {
              let updatePKBalance;
              const totalP205AndK20 = await this.getTotalP205AndK20(
                fertiliserData,
                managementPeriodData[0]?.ID
              );

              const recommandationData =
                await this.getTotalFertiliserP205AndK20FromRecommandation(
                  managementPeriodData[0]?.ID,
                  recommandationAllData
                );

              if (totalP205AndK20 && recommandationData) {
                let pBalance =
                  totalP205AndK20.p205 +
                  fertiliserManureData[0]?.P2O5 -
                  recommandationData.p205;
                let kBalance =
                  totalP205AndK20.k20 +
                  fertiliserManureData[0]?.K2O -
                  recommandationData.k20;

                if (cropData[0].CropTypeID == CropTypeMapper.OTHER) {
                  const farmData = await this.farmRepository.findOneBy({
                    ID: fieldData[0].FarmID,
                  });

                  const rb209CountryData = await transactionalManager.findOne(
                    CountryEntity,
                    {
                      where: {
                        ID: farmData.CountryID,
                      },
                    }
                  );

                  const {
                    latestSoilAnalysis,
                    errors: soilAnalysisErrors,
                    soilAnalysisRecords,
                  } = await this.HandleSoilAnalysisService.handleSoilAnalysisValidation(
                    fieldData[0].ID,
                    fieldData[0].Name,
                    cropData[0]?.Year,
                    rb209CountryData.RB209CountryID
                  );
                  const otherPKBalance =
                    await this.CalculatePKBalanceOther.calculatePKBalanceOther(
                      cropData[0],
                      latestSoilAnalysis,
                      transactionalManager
                    );

                  pBalance = otherPKBalance.pBalance;
                  kBalance = otherPKBalance.kBalance;
                }
                const updateData = {
                  Year: cropData[0]?.Year,
                  FieldID: fieldData[0]?.ID,
                  PBalance: pBalance,
                  KBalance: kBalance,
                };

                updatePKBalance = {
                  ...pkBalanceData[0],
                  ...updateData,
                  ModifiedOn: new Date(),
                  ModifiedByID: userId,
                };
              }
              if (updatePKBalance) {
                await transactionalManager.save(
                  PKBalanceEntity,
                  updatePKBalance
                );
              }
                   const nextAvailableCrop = await this.cropRepository.findOne({
                     where: {
                       FieldID: cropData.FieldID,
                       Year: MoreThan(cropData.Year),
                     },
                     order: { Year: "ASC" },
                   });

                   if (nextAvailableCrop) {
                     this.UpdateRecommendation.updateRecommendationsForField(
                       cropData.FieldID,
                       nextAvailableCrop.Year,
                       request,
                       userId
                     );
                   }
            }
          }
        }
      }
      return fertiliserManures;
    });
  }

  async getTotalP205AndK20(fertiliserData, managementPeriodId) {
    let sumOfP205 = 0;
    let sumOfK20 = 0;

    // const  fertiliserFilteredData= fertiliserData.filter((fertData) => {
    //     return (
    //       fertData.ManagementPeriodID === managementPeriodId
    //     );
    //   });

    if (fertiliserData && fertiliserData.length > 0) {
      for (const fertiliser of fertiliserData) {
        sumOfP205 += fertiliser.P2O5 || 0;
        sumOfK20 += fertiliser.K2O || 0;
      }
    }

    return { p205: sumOfP205, k20: sumOfK20 };
  }
  async getTotalFertiliserP205AndK20FromRecommandation(
    managementPeriodID,
    recommandationAllData
  ) {
    let sumOfFertliserP205 = 0;
    let sumOfFertiliserK20 = 0;

    const recommandationData = recommandationAllData
      .filter((item) => item.ManagementPeriodID === managementPeriodID)
      .map((item) => ({
        FertilizerP2O5: item.FertilizerP2O5,
        FertilizerK2O: item.FertilizerK2O,
      }));

    if (recommandationData && recommandationData.length > 0) {
      for (const recommandation of recommandationData) {
        sumOfFertliserP205 += recommandation.FertilizerP2O5 || 0;
        sumOfFertiliserK20 += recommandation.FertilizerK2O || 0;
      }
    }

    return { p205: sumOfFertliserP205, k20: sumOfFertiliserK20 };
  }

  async updateFertiliser(updatedFertiliserManureData, userId, request) {
    return await AppDataSource.transaction(async (transactionalManager) => {
      const updatedFertilisers = [];
      for (const manure of updatedFertiliserManureData) {
        // const {
        //   ID,
        //   CreatedByID,
        //   CreatedOn,
        //   ManagementPeriodID,
        //   ...updatedData
        // } = manure;
        const {
          ID,
          CreatedByID,
          CreatedOn,
          FieldName,
          EncryptedCounter,
          Defoliation,
          FieldID,
          DefoliationName,
          ...updatedData
        } = manure;
        // Update fertiliseremanure
        const result = await transactionalManager.update(
          FertiliserManuresEntity,
          ID,
          {
            ...updatedData,
            ModifiedByID: userId,
            ModifiedOn: new Date(),
          }
        );

        if (result.affected === 0) {
          console.log(`Fertiliser Manures with ID ${ID} not found`);
        }

        const fertiliserManure = await transactionalManager.findOne(
          FertiliserManuresEntity,
          {
            where: { ID: ID },
          }
        );
        if (fertiliserManure) {
          updatedFertilisers.push(fertiliserManure);
        }
        const managementPeriod = await this.managementPeriodRepository.findOne({
          where: { ID: fertiliserManure.ManagementPeriodID },
        });
        const crop = await this.cropRepository.findOne({
          where: { ID: managementPeriod.CropID },
        });

        // await this.UpdateRecommendationChanges.updateRecommendationAndOrganicManure(
        //   crop.FieldID,
        //   crop.Year,
        //   request,
        //   userId,
        //   transactionalManager
        // );

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
          this.UpdateRecommendation.updateRecommendationsForField(
            crop.FieldID,
            nextAvailableCrop.Year,
            request,
            userId
          )
            .then((res) => {
              if (res === undefined) {
                console.log(
                  "updateRecommendationAndOrganicManure returned undefined"
                );
              } else {
                console.log(
                  "updateRecommendationAndOrganicManure result:",
                  res
                );
              }
            })
            .catch((error) => {
              console.error(
                "Error updating recommendation and organic manure:",
                error
              );
            });
        }
      }
      return { FertiliserManure: updatedFertilisers };
    });
  }

  async getFertiliserByFarmIdAndYear(fertiliserId, farmId, harvestYear) {
    try {
      const storedProcedure =
        "EXEC dbo.spFertiliserManures_GetByFarmIdAndYear @farmId = @0, @harvestYear = @1";
      const fertiliserData = await this.executeQuery(storedProcedure, [
        farmId,
        harvestYear,
      ]);
      const fertiliser = await this.repository.findOne({
        where: { ID: fertiliserId },
      });

      const records =
        fertiliserData.length > 0 && fertiliser != null
          ? fertiliserData.filter((item) => {
              const itemDate = new Date(item?.ApplicationDate);
              const fertiliserDate = new Date(fertiliser?.ApplicationDate);
              const isMatching =
                itemDate.getTime() === fertiliserDate.getTime() &&
                item?.Nitrogen === fertiliser?.N &&
                item?.P2O5 === fertiliser?.P2O5 &&
                item?.SO3 === fertiliser?.SO3 &&
                item?.K2O === fertiliser?.K2O &&
                item?.Lime === fertiliser?.Lime &&
                item?.MgO === fertiliser?.MgO;

              return isMatching;
            })
          : null;

      return records;
    } catch (error) {
      console.error("Error occurred while fetching fertiliser records:", error);
      return null;
    }
  }

  async deleteFertiliserManure(fertliserManureId, userId, request) {
    return await AppDataSource.transaction(async (transactionalManager) => {
      // Check if the Organic Manure exists
      const fertiliserManureToDelete = await this.repository.findOneBy({
        ID: fertliserManureId,
      });

      // If the fertiliserManure does not exist, throw a not found error
      if (fertiliserManureToDelete == null) {
        console.log(`Fertiliser Manure with ID ${fertliserManureId} not found`);
      }
      const managementPeriod = await this.managementPeriodRepository.findOne({
        where: { ID: fertiliserManureToDelete.ManagementPeriodID },
        select: ["CropID"],
      });

      // If the managementPeriod does not exist, throw a not found error
      if (managementPeriod == null) {
        console.log(
          `managementPeriod with ID ${fertiliserManureToDelete.ManagementPeriodID} not found`
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
        // Call the stored procedure to delete the fertliserManureId and related entities
        const storedProcedure =
          "EXEC [spFertiliserManures_DeleteFertiliserManures] @ID = @0";
        await transactionalManager.query(storedProcedure, [fertliserManureId]);

        await this.UpdateRecommendationChanges.updateRecommendationAndOrganicManure(
          crop.FieldID,
          crop.Year,
          request,
          userId,
          transactionalManager
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
          this.UpdateRecommendation.updateRecommendationsForField(
            crop.FieldID,
            nextAvailableCrop.Year,
            request,
            userId
          )
            .then((res) => {
              if (res === undefined) {
                console.log(
                  "updateRecommendationAndOrganicManure returned undefined"
                );
              } else {
                console.log(
                  "updateRecommendationAndOrganicManure result:",
                  res
                );
              }
            })
            .catch((error) => {
              console.error(
                "Error updating recommendation and organic manure:",
                error
              );
            });
        }
        return { affectedRows: 1 }; // Success response
      } catch (error) {
        // Log the error and throw an internal server error
        console.error("Error deleting fertiliserManure:", error);
      }
    });
  }
   async getTotalNitrogenByManagementPeriodID(managementPeriodID) {
    const fertiliserManuresResult = await this.repository
      .createQueryBuilder("fertiliserManures")
      .select(
        "SUM(fertiliserManures.N * fertiliserManures.ApplicationRate)",
        "totalN"
      )
      .where("fertiliserManures.ManagementPeriodID = :managementPeriodID", {
        managementPeriodID,
      });

    const fertiliserResult = await fertiliserManuresResult.getRawOne();
    console.log("fertiliserResult", fertiliserResult);
    
    return fertiliserResult.totalN;
  }
}

module.exports = { FertiliserManuresService };
