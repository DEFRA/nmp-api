const { AppDataSource } = require("../db/data-source");
const { SoilAnalysisEntity } = require("../db/entity/soil-analysis.entity")
const { BaseService } = require("../base/base.service");

class SoilAnalysesService extends BaseService {
  constructor() {
    super(SoilAnalysisEntity);
    this.repository = AppDataSource.getRepository(SoilAnalysisEntity);
  }

  async createSoilAnalysis(soilAnalysisBody, userId) {
    const soilAnalysis = await this.repository.save({
      ...soilAnalysisBody,
      CreatedByID: userId,
    });
    return soilAnalysis;
  }

  async updateSoilAnalysis(updatedSoilAnalysisData, userId, soilAnalysisId,pKBalanceData) {
    const { CreatedByID, CreatedOn, ...updatedData } = updatedSoilAnalysisData;
    const result = await this.repository.update(soilAnalysisId, {
      ...updatedData,
      ModifiedByID: userId,
      ModifiedOn: new Date(),
    });

    if (result.affected === 0) {
      throw new Error(`Soil Analysis with ID ${soilAnalysisId} not found`);
    }
    const updatedSoilAnalysis = await this.repository.findOne({
      where: { ID: soilAnalysisId },
    });
    if(updatedSoilAnalysis.Potassium!=null||updatedSoilAnalysis.Phosphorus!=null)
    {          
          let PKBalance = null;
          if (body.PKBalance) {
            const result =  await this.repository.save({
              ...pKBalanceData,
              CreatedByID: userId,
            });
          }
    }
    return updatedSoilAnalysis;
  }
}

module.exports = { SoilAnalysesService };
