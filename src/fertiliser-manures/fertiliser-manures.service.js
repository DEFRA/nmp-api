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

  async createFertiliserManures(fertiliserManureData, userId,request) {
    const cropPlanAllData = await this.cropRepository.find({
      select: ["ID", "FieldID", "Year"],
    });
    const managementPeriodAllData =
      await this.managementPeriodRepository.find();
    const fertiliserAllData = await this.repository.find();
    return await AppDataSource.transaction(async (transactionalManager) => {
      const fertiliserManures = fertiliserManureData.map(({ ID, ...rest }) => ({
        ...rest,
        CreatedByID: userId,
        CreatedOn: new Date(),
      }));
      const fertiliserData = await this.repository.find({
        where: {
          ManagementPeriodID: fertiliserManureData[0].ManagementPeriodID,
        },
      });

      const savedFertiliserManures = await transactionalManager.save(
        FertiliserManuresEntity,
        fertiliserManures
      );

      const managementPeriodData =
        await this.managementPeriodRepository.findOneBy({
          ID: fertiliserManureData[0].ManagementPeriodID,
        });

      const cropData = await this.cropRepository.findOneBy({
        ID: managementPeriodData.CropID,
      });

      const fieldData = await this.fieldRepository.findOneBy({
        ID: cropData.FieldID,
      });

      const pkBalanceData = await this.pkBalanceRepository.findOne({
        where: { Year: cropData?.Year, FieldID: fieldData.ID },
      });
      const cropPlanForNextYear = cropPlanAllData.filter((cropPlan) => {
        return (
          cropPlan.FieldID === fieldData.ID && cropPlan.Year > cropData?.Year
        );
      });
      console.log("cropPlanForNextYear", cropPlanForNextYear);
      let isNextYearPlanExist = false;
      let isNextYearFertiliserExist = false;
      if (cropPlanForNextYear) {
        isNextYearPlanExist = true;
        for (const crop of cropPlanForNextYear) {
          console.log("CropID", crop.ID);
          const managementPeriodDataId = managementPeriodAllData
            .filter((manData) => manData.CropID === crop.ID)
            .map((manData) => manData.ID);
          console.log("managementPeriodDataId", managementPeriodDataId);
          if (managementPeriodDataId.length > 0) {
            const filterFertiliserData = fertiliserAllData.filter(
              (fertData) =>
                fertData.ManagementPeriodID === managementPeriodDataId[0]
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
      if(isNextYearPlanExist == true && isNextYearFertiliserExist == true) {
        //call shreyash's function
        this.UpdateRecommendation.updateRecommendationsForField(
          fieldData.ID ,
          cropData?.Year,
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
        if (pkBalanceData) {
          let updatePKBalance;
          const totalP205AndK20 = await this.getTotalP205AndK20(
            fertiliserData,
            managementPeriodData.ID
          );

          const recommandationData =
            await this.getTotalFertiliserP205AndK20FromRecommandation(
              managementPeriodData.ID
            );

          if (totalP205AndK20&&
            recommandationData
          ) {
            let pBalance =
              totalP205AndK20.p205 +
              fertiliserManureData[0].P2O5 -
              recommandationData.p205;
            let kBalance =
              totalP205AndK20.k20 +
              fertiliserManureData[0].K2O -
              recommandationData.k20;
            const updateData = {
              Year: cropData?.Year,
              FieldID: fieldData.ID,
              PBalance: pBalance,
              KBalance: kBalance,
            };

            updatePKBalance = {
              ...pkBalanceData,
              ...updateData,
              ModifiedOn: new Date(),
              ModifiedByID: userId,
            };
            console.log("updatePKBalance", updatePKBalance);
          }
          if (updatePKBalance) {
            await transactionalManager.save(PKBalanceEntity, updatePKBalance);
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
  async getTotalFertiliserP205AndK20FromRecommandation(managementPeriodID) {
    let sumOfFertliserP205 = 0;
    let sumOfFertiliserK20 = 0;

    const recommandationData = await this.RecommendationRepository.find({
      where: {
        ManagementPeriodID: managementPeriodID,
      },
      select: {
        FertilizerP2O5: true,
        FertilizerK2O: true,
      },
    });

    if (recommandationData && recommandationData.length > 0) {
      for (const recommandation of recommandationData) {
        sumOfFertliserP205 += recommandation.FertilizerP2O5 || 0;
        sumOfFertiliserK20 += recommandation.FertilizerK2O || 0;
      }
    }

    return { p205: sumOfFertliserP205, k20: sumOfFertiliserK20 };
  }
}

module.exports = { FertiliserManuresService };
