const { PKBalanceEntity } = require("../db/entity/pk-balance.entity");
const { BaseService } = require("../base/base.service");
const { AppDataSource } = require("../db/data-source");
const { SoilAnalysisHelper } = require("../shared/soil-analysis-helper");

class PKBalanceService extends BaseService {
  constructor() {
    super(PKBalanceEntity);
    this.repository = AppDataSource.getRepository(PKBalanceEntity);
    this.soilAnalysisHelper = new SoilAnalysisHelper();
  }

  async createPKBalance(pKBalanceBody, userId, transactionalManager = null) {
    const manager = transactionalManager || AppDataSource.manager;
    
    const soilAnalysisCheck = await this.soilAnalysisHelper.validateSoilAnalysisExists(
      pKBalanceBody.FieldID,
      pKBalanceBody.Year,
      manager
    );

    // If no soil analysis, log and save with 0 values
    if (!soilAnalysisCheck.exists) {
      console.warn(
        `No soil analysis for FieldID: ${pKBalanceBody.FieldID}, Year: ${pKBalanceBody.Year}. ` +
        "Saving PK balance with 0 values."
      );
      pKBalanceBody.PBalance = 0;
      pKBalanceBody.KBalance = 0;
    }

    const { ID, ModifiedOn, ...PKBalance } = this.repository.create(
      pKBalanceBody
    );
    const pKBalance = await this.repository.save({
      ...PKBalance,
      CreatedByID: userId,
    });
    return pKBalance;
  }

  async updatePKBalance(
    updatedPKBalanceData,
    userId,
    pKBalanceId,
    transactionalManager = null
  ) {
    const manager = transactionalManager || AppDataSource.manager;
    
    const soilAnalysisCheck = await this.soilAnalysisHelper.validateSoilAnalysisExists(
      updatedPKBalanceData.FieldID,
      updatedPKBalanceData.Year,
      manager
    );

    // If no soil analysis, log and set 0 values
    if (!soilAnalysisCheck.exists) {
      console.warn(
        `No soil analysis for FieldID: ${updatedPKBalanceData.FieldID}, Year: ${updatedPKBalanceData.Year}. ` +
        "Updating PK balance to 0 values."
      );
      updatedPKBalanceData.PBalance = 0;
      updatedPKBalanceData.KBalance = 0;
    }

    const {
      Year,
      ID,
      FieldID,
      CreatedByID,
      CreatedOn,
      PreviousID,
      ...updatedData
    } = updatedPKBalanceData;
    const result = await this.repository.update(pKBalanceId, {
      ...updatedData,
      ModifiedByID: userId,
      ModifiedOn: new Date(),
    });

    if (result.affected === 0) {
      const error = new Error(
        `PK Balance with ID ${pKBalanceId} not found`
      );
      error.statusCode = 404;
      error.code = "PK_BALANCE_NOT_FOUND";
      throw error;
    }

    const updatedPKBalance = await this.repository.findOne({
      where: { ID: pKBalanceId },
    });
    return updatedPKBalance;
  }

  async getPKBalanceByYearAndFieldId(Year,FieldID) {
    const data = await this.repository.findOne({
      where: {
        FieldID: FieldID,
        Year: Year
      },
    });
    return data;
  }
}
module.exports = { PKBalanceService };
