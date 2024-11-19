const { PKBalanceEntity } = require("../db/entity/pk-balance.entity");
const { BaseService } = require("../base/base.service");
const { AppDataSource } = require("../db/data-source");

class PKBalanceService extends BaseService {
    

    async createPKBalance(pKBalanceBody, userId) {
      const pKBalance = await this.repository.save({
        ...soilAnalysisBody,
        CreatedByID: userId,
      });
        return pKBalance;
      }

      async updatePKBalance(updatedPKBalanceData, userId, pKBalanceId) {
        const { CreatedByID, CreatedOn, ...updatedData } = updatedPKBalanceData;
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
}