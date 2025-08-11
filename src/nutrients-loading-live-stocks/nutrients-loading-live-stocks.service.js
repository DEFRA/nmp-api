const { BaseService } = require("../base/base.service");
const { AppDataSource } = require("../db/data-source");
const { NutrientsLoadingLiveStocksEntity } = require("../db/entity/nutrients-loading-live-stocks-entity");
const { LivestockTypeEntity } = require("../db/entity/livestock-type-entity");
class NutrientsLoadingLiveStocksService extends BaseService {
  constructor() {
    super(NutrientsLoadingLiveStocksEntity);
    this.repository = AppDataSource.getRepository(NutrientsLoadingLiveStocksEntity);
        this.LivestockTypeRepository = AppDataSource.getRepository(
          LivestockTypeEntity
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
          CalendarYear:CalendarYear,
          FarmID: FarmID,
          CreatedOn: new Date(),
          CreatedByID: userId
        }
      );
    
      const saved = await transactionalManager.save(
        NutrientsLoadingLiveStocksEntity,
        newRecord
      );

      const savedRecord = await transactionalManager.findOne(
        NutrientsLoadingLiveStocksEntity,
        { where: { FarmID: FarmID,CalendarYear: CalendarYear } }
      );


      return savedRecord;
    
    });
  }

  
}

module.exports = { NutrientsLoadingLiveStocksService };
