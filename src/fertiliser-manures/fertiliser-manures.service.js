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

class FertiliserManuresService extends BaseService {
  constructor() {
    super(FertiliserManuresEntity);
    this.repository = AppDataSource.getRepository(FertiliserManuresEntity);
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
    this.soilAnalysisRepository =
      AppDataSource.getRepository(SoilAnalysisEntity);
  }
  async getFertiliserManureNitrogenSum(
    managementPeriodID,
    fromDate,
    toDate,
    confirm
  ) {
    const result = await this.repository
      .createQueryBuilder("fertiliserManures")
      .select(
        "SUM(fertiliserManures.N * fertiliserManures.ApplicationRate)",
        "totalN"
      )
      .where("fertiliserManures.ManagementPeriodID = :managementPeriodID", {
        managementPeriodID,
      })
      .andWhere(
        "fertiliserManures.ApplicationDate BETWEEN :fromDate AND :toDate",
        { fromDate, toDate }
      )
      .andWhere("fertiliserManures.Confirm = :confirm", { confirm })
      .getRawOne();
    return result.totalN;
  }

  async getTotalNitrogen(managementPeriodID, confirm) {
    const fertiliserManuresResult = await this.repository
      .createQueryBuilder("fertiliserManures")
      .select(
        "SUM(fertiliserManures.N * fertiliserManures.ApplicationRate)",
        "totalN"
      )
      .where("fertiliserManures.ManagementPeriodID = :managementPeriodID", {
        managementPeriodID,
      })
      .andWhere("fertiliserManures.Confirm = :confirm", { confirm })
      .getRawOne();
    const organicManuresResult = await this.organicManureRepository
      .createQueryBuilder("organicManures")
      .select(
        "SUM(organicManures.N * organicManures.ApplicationRate)",
        "totalN"
      )
      .where("organicManures.ManagementPeriodID = :managementPeriodID", {
        managementPeriodID,
      })
      .andWhere("organicManures.Confirm = :confirm", { confirm })
      .getRawOne();
    return fertiliserManuresResult.totalN + organicManuresResult.totalN;
  }

  async createFertiliserManures(fertiliserManureData, userId, request) {
    const cropPlanAllData = await this.cropRepository.find();
    const recommandationAllData = await this.RecommendationRepository.find();
    const managementPeriodAllData =
      await this.managementPeriodRepository.find();
    const fieldAllData = await this.fieldRepository.find();
   

    const fertiliserAllData = await this.repository.find();
    return await AppDataSource.transaction(async (transactionalManager) => {
      const fertiliserManures = fertiliserManureData.map(({ ID, ...rest }) => ({
        ...rest,
        CreatedByID: userId,
        CreatedOn: new Date(),
      }));
      const soilAnalysisAllData = await this.soilAnalysisRepository.find();
      const pkBalanceAllData = await this.pkBalanceRepository.find();

      const savedFertiliserManures = await transactionalManager.save(
        FertiliserManuresEntity,
        fertiliserManures
      );
      console.log("fertiliserManures", fertiliserManures);
      // const managementPeriodData =
      //   await this.managementPeriodRepository.findOneBy({
      //     ID: fertiliserManureData[0].ManagementPeriodID,
      //   });
      for (const fertManure of fertiliserManures) {
        const fertiliserData =fertiliserAllData.filter(
          (fertData) => {
            return fertData.ManagementPeriodID === fertManure.ManagementPeriodID;
          }
        );
        const managementPeriodData = managementPeriodAllData.filter(
          (manData) => {
            return manData.ID === fertManure.ManagementPeriodID;
          }
        );
        const cropData = cropPlanAllData.filter((cropData) => {
          return cropData.ID === managementPeriodData[0].CropID;
        });
        
        const fieldData = fieldAllData.filter((fieldData) => {
          return fieldData.ID === cropData[0].FieldID;
        });
        
        const soilAnalsisData = soilAnalysisAllData.filter((soilAnalyses) => {
          return soilAnalyses.FieldID === cropData[0].FieldID;
        });
        let isSoilAnalysisHavePAndK = false;
        if (soilAnalsisData.length>0) {
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
              pkBalance.FieldID === fieldData[0].ID &&
              pkBalance.Year ===cropData[0].Year
            );
          });
          // ({
          //   where: { Year: cropData[0].Year, FieldID: fieldData[0].ID },
          // });
          const cropPlanForNextYear = cropPlanAllData.filter((cropPlan) => {
            return (
              cropPlan.FieldID === fieldData[0].ID &&
              cropPlan.Year > cropData[0].Year
            );
          });
          let isNextYearPlanExist = false;
          let isNextYearFertiliserExist = false;
          if (cropPlanForNextYear&&cropPlanForNextYear.length>0) {
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
                console.log("fertiliserId", filterFertiliserData);

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
          if (
            isNextYearPlanExist == true &&
            isNextYearFertiliserExist == true
          ) {
            //call shreyash's function
            this.UpdateRecommendation.updateRecommendationsForField(
              fieldData[0].ID,
              cropData[0].Year,
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
            console.log("pkBalanceData", pkBalanceData);
            if (pkBalanceData.length>0) {
              let updatePKBalance;
              const totalP205AndK20 = await this.getTotalP205AndK20(
                fertiliserData,
                managementPeriodData[0].ID
              );

              const recommandationData =
                await this.getTotalFertiliserP205AndK20FromRecommandation(
                  managementPeriodData[0].ID,
                  recommandationAllData
                );

              if (totalP205AndK20 && recommandationData) {
                let pBalance =
                  totalP205AndK20.p205 +
                  fertiliserManureData[0].P2O5 -
                  recommandationData.p205;
                let kBalance =
                  totalP205AndK20.k20 +
                  fertiliserManureData[0].K2O -
                  recommandationData.k20;
                const updateData = {
                  Year: cropData[0].Year,
                  FieldID: fieldData[0].ID,
                  PBalance: pBalance,
                  KBalance: kBalance,
                };

                updatePKBalance = {
                  ...pkBalanceData[0],
                  ...updateData,
                  ModifiedOn: new Date(),
                  ModifiedByID: userId,
                };
                console.log("updatePKBalance", updatePKBalance);
              }
              if (updatePKBalance) {
                await transactionalManager.save(
                  PKBalanceEntity,
                  updatePKBalance
                );
              }
            }
          }
        }
      }
      return savedFertiliserManures;
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
  async getTotalFertiliserP205AndK20FromRecommandation(managementPeriodID,recommandationAllData) {
    let sumOfFertliserP205 = 0;
    let sumOfFertiliserK20 = 0;

    const recommandationData =recommandationAllData
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
  async deleteFertiliser(fertiliserId,userId,request) {
  
      return await AppDataSource.transaction(async (transactionalManager) => {
        // Check if the fertiliser exists
        const fertiliserToDelete = await await transactionalManager.findOne(
          FertiliserManuresEntity,
          {
            where: { ID: fertiliserId },
         });
         
        // If the fertiliser does not exist, throw a not found error    
        if (fertiliserToDelete == null) {
          console.log(`fertiliser with ID ${fertiliserId} not found`);
        }
        const managementPeriod = await this.managementPeriodRepository.findOne({
          where: { ID: fertiliserToDelete.ManagementPeriodID },
          select: ["CropID"],
        });
        
        // If the managementPeriod does not exist, throw a not found error    
        if (managementPeriod == null) {
          console.log(`managementPeriod with ID ${fertiliserToDelete.ManagementPeriodID} not found`);
        }
        const crop = await this.cropRepository.findOne({
          where: { ID: managementPeriod.CropID },
          select: ["ID"],
        });
        console.log('crop',crop)
        // If the crop does not exist, throw a not found error    
        if (crop == null) {
          console.log(`crop with ID ${managementPeriod.CropID} not found`);
        }
        try {
          // Call the stored procedure to delete the fertiliserId and related entities
          const storedProcedure = "EXEC [spFertiliserManures_DeleteFertiliserManures] @ID = @0";
          await AppDataSource.query(storedProcedure, [fertiliserId]);
  
          console.log("start");
          this.UpdateRecommendation.updateRecommendationsForField(
            crop.FieldID,
            crop.Year,
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
  
        } catch (error) {
          // Log the error and throw an internal server error
          console.error("Error deleting fertilisers:", error);
        }
      });
    }
}

module.exports = { FertiliserManuresService };
