const { AppDataSource } = require("../db/data-source");
const { SoilAnalysisEntity } = require("../db/entity/soil-analysis.entity");
const { BaseService } = require("../base/base.service");
const { PKBalanceEntity } = require("../db/entity/pk-balance.entity");

class SoilAnalysesService extends BaseService {
  constructor() {
    super(SoilAnalysisEntity);
    this.repository = AppDataSource.getRepository(SoilAnalysisEntity);
    this.pkBalanceRepository = AppDataSource.getRepository(PKBalanceEntity);
  }

  async createSoilAnalysis(soilAnalysisBody, userId) {
    const soilAnalysis = await this.repository.save({
      ...soilAnalysisBody,
      CreatedByID: userId,
    });
    return soilAnalysis;
  }

  async updateSoilAnalysis(
    updatedSoilAnalysisData,
    userId,
    soilAnalysisId,
    pKBalanceData
  ) {
    const { CreatedByID, CreatedOn, ...updatedData } = updatedSoilAnalysisData;
    const result = await this.repository.update(soilAnalysisId, {
      ...updatedData,
      ModifiedByID: userId,
      ModifiedOn: new Date(),
    });

    if (result.affected === 0) {
      throw new Error(`Soil Analysis with ID ${soilAnalysisId} not found`);
    }
    const SoilAnalysis = await this.repository.findOne({
      where: { ID: soilAnalysisId },
    });
    let pkBalanceEntry = await this.pkBalanceRepository.find({
      where: { Year: SoilAnalysis.Date.Year, FieldID: SoilAnalysis.FieldID },
    });

    let newPKBalanceData = null;
    
      if (SoilAnalysis.Potassium != null || SoilAnalysis.Phosphorus != null) {        
        if (pkBalanceEntry.length == 0) {
        if (pKBalanceData) {
          let { CreatedByID, CreatedOn, ...updatedPKBalanceData } =
            pKBalanceData;
            newPKBalanceData = await this.pkBalanceRepository.save({
            ...updatedPKBalanceData,
            CreatedByID: userId,
          });
        } 
      }
    }else {
       await this.pkBalanceRepository.delete({
        Year: SoilAnalysis.Year,
        FieldID: SoilAnalysis.FieldID,
      });
    }
    let PKBalance = await this.pkBalanceRepository.findOne({
      where: { Year: SoilAnalysis.Date.Year, FieldID: SoilAnalysis.FieldID },
    });
    return { SoilAnalysis, PKBalance };
  }
}

module.exports = { SoilAnalysesService };
