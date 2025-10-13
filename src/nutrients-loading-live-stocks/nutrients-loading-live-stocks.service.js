const { BaseService } = require("../base/base.service");
const { AppDataSource } = require("../db/data-source");
const {
  NutrientsLoadingLiveStocksEntity,
} = require("../db/entity/nutrients-loading-live-stocks-entity");
const { LivestockTypeEntity } = require("../db/entity/livestock-type-entity");
const {
  NutrientsLoadingFarmDetailsEntity,
} = require("../db/entity/nutrients-loading-farm-details-entity");
const boom = require("@hapi/boom");


class NutrientsLoadingLiveStocksService extends BaseService {
  constructor() {
    super(NutrientsLoadingLiveStocksEntity);
    this.repository = AppDataSource.getRepository(
      NutrientsLoadingLiveStocksEntity
    );
    this.LivestockTypeRepository =
      AppDataSource.getRepository(LivestockTypeEntity);

    this.nutrientsLoadingFarmDetailsRepository = AppDataSource.getRepository(
      NutrientsLoadingFarmDetailsEntity
    );
  }

  async getByFarmIdAndYear(farmId, year) {
    const records = await this.repository.findBy({
      FarmID: farmId,
      CalendarYear: year,
    });

    for (const record of records) {
      const livestock = await this.LivestockTypeRepository.findOne({
        where: { ID: record.LiveStockTypeID },
      });
      record.LiveStockType = livestock ? livestock.Name : null;
    }

    return records;
  }

  async createNutrientsLiveStocks(payload, userId) {
    return await AppDataSource.transaction(async (transactionalManager) => {
      const {
        ID,
        FarmID,
        CalendarYear,
        CreatedByID,
        CreatedOn,
        ...cleanPayload
      } = payload;

      // const existingRecord = await transactionalManager.findOne(
      //   NutrientsLoadingLiveStocksEntity,
      //   { where: { FarmID: FarmID, CalendarYear: CalendarYear } }
      // );

      //  if (existingRecord) {
      //    return { message: "Record already exists", existingRecord };
      //  }
      const newRecord = transactionalManager.create(
        NutrientsLoadingLiveStocksEntity,
        {
          ...cleanPayload,
          CalendarYear: CalendarYear,
          FarmID: FarmID,
          CreatedOn: new Date(),
          CreatedByID: userId,
        }
      );

      const saved = await transactionalManager.save(
        NutrientsLoadingLiveStocksEntity,
        newRecord
      );

      const savedRecord = await transactionalManager.findOne(
        NutrientsLoadingLiveStocksEntity,
        { where: { ID: saved.ID } }
      );
      if (savedRecord != null) {
        const nutrientsLoadingFarmDetails =
          await this.nutrientsLoadingFarmDetailsRepository.findOneBy({
            FarmID: FarmID,
            CalendarYear: CalendarYear,
          });
        if (
          nutrientsLoadingFarmDetails != null &&
          nutrientsLoadingFarmDetails.IsAnyLivestockNumber != 1
        ) {
          await transactionalManager.update(
            NutrientsLoadingFarmDetailsEntity,
            nutrientsLoadingFarmDetails.ID,
            {
              IsAnyLivestockNumber: 1,
            }
          );
        }
      }
      return savedRecord;
    });
  }
  async updateNutrientsLoadingLiveStocks(payload, userId) {
    const {
      ID,
      FarmID,
      CalendarYear,
      CreatedByID,
      CreatedOn,
      ...dataToUpdate
    } = payload;

    const result = await AppDataSource.transaction(
      async (transactionalManager) => {
        
        const updateResult = await transactionalManager.update(
          NutrientsLoadingLiveStocksEntity,
          { ID },
          {
            ...dataToUpdate,
            FarmID:FarmID,
            CalendarYear:CalendarYear,
            ModifiedByID: userId,
            ModifiedOn: new Date(),
          }
        );

        if (updateResult.affected === 0) {
          throw boom.notFound(
            `NutrientsLoadingLive with FarmId ${FarmID} and CalendarYear ${CalendarYear} not found`
          );
        }

         const updatedRecord = await transactionalManager.findOne(
           NutrientsLoadingLiveStocksEntity,
           { where: { ID: ID } }
         );

        return updatedRecord;
      }
    );

    return result;
  }
   async deleteNutrientsLoadingLivestockById(nutrientsLoadingLivestockId) {
    // Check if the NutrientsLoadingLivestock exists
    const nutrientsLoadingLivestockData = await this.repository.findOne({
      where: { ID: nutrientsLoadingLivestockId },
    });

    // If the NutrientsLoadingLivestock does not exist, throw a not found error
    if (nutrientsLoadingLivestockData == null) {
      throw boom.notFound(
        `NutrientsLoadingLivestock with ID ${nutrientsLoadingLivestockId} not found`
      );
    }

    try {
      // Call the stored procedure to delete the NutrientsLoadingLivestock
      const storedProcedure =
        "EXEC [dbo].[spNutrientsLoadingLiveStocks_DeleteNutrientsLoadingLiveStocks] @NutrientsLoadingLiveStockID = @0";
      await AppDataSource.query(storedProcedure, [nutrientsLoadingLivestockId]);
    } catch (error) {
      // Log the error and throw an internal server error
      console.error("Error deleting NutrientsLoadingLivestock:", error);
    }
  }
}

module.exports = { NutrientsLoadingLiveStocksService };
