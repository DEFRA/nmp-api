const { BaseService } = require("../base/base.service");
const { AppDataSource } = require("../db/data-source");
const { NutrientsLoadingLiveStocksEntity } = require("../db/entity/nutrients-loading-live-stocks-entity");

class NutrientsLoadingLiveStocksService extends BaseService {
  constructor() {
    super(NutrientsLoadingLiveStocksEntity);
    this.repository = AppDataSource.getRepository(NutrientsLoadingLiveStocksEntity);
  }

  async getByFarmIdAndYear(farmId,year) {
    const record = await this.repository.findBy({
      FarmID: farmId,
      CalendarYear:year
    });
    return  record ;
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
