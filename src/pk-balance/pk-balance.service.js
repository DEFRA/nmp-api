const { PKBalanceEntity } = require("../db/entity/pk-balance.entity");
const { BaseService } = require("../base/base.service");
const { AppDataSource } = require("../db/data-source");

class PKBalanceService extends BaseService {
  constructor() {
    super(PKBalanceEntity);
    this.repository = AppDataSource.getRepository(PKBalanceEntity);
   
  }

  async createPKBalance(pKBalanceBody, userId) {
    const {ID,ModifiedOn,...PKBalance} = this.repository.create(pKBalanceBody);
    const pKBalance = await this.repository.save({
      ...PKBalance,
      CreatedByID: userId,
    });
    return pKBalance;
  }

  async updatePKBalance(updatedPKBalanceData, userId, pKBalanceId) {
    const { Year,ID,FieldID, CreatedByID, CreatedOn, PreviousID, ...updatedData } =
      updatedPKBalanceData;
    const result = await this.repository.update(pKBalanceId, {
      ...updatedData,
      ModifiedByID: userId,
      ModifiedOn: new Date(),
    });

    if (result.affected === 0) {
      throw new Error(`PK Balance with ID ${pKBalanceId} not found`);
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

  async resetPKBalanceToZero(fieldID, year, userId, transactionalManager) {
    try {
      const pkBalance = await transactionalManager.findOne(PKBalanceEntity, {
        where: {
          FieldID: fieldID,
          Year: year,
        },
      });

      if (!pkBalance) {
        return null;
      }

      const resetBalance = {
        ...pkBalance,
        PBalance: 0,
        KBalance: 0,
        ModifiedOn: new Date(),
        ModifiedByID: userId,
      };

      await transactionalManager.save(PKBalanceEntity, resetBalance);

      return resetBalance;
    } catch (error) {
      console.error("Error resetting PK Balance to zero:", error);
      throw error;
    }
  }
}
module.exports = { PKBalanceService };
