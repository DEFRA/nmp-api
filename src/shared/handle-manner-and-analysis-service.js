const {
  CalculateCropsSnsAnalysisService,
} = require("./calculate-crops-sns-analysis-service");
const {
  CalculateMannerOutputService,
} = require("./calculate-manner-output-service");
const { HandleSoilAnalysisService } = require("./handle-soil-analysis");
const {
  CalculatePreviousCropService,
} = require("./previous-year-crop-service");

class HanldeMannerAndAnalysis {
  constructor() {
    this.HandleSoilAnalysisService = new HandleSoilAnalysisService();
    this.CalculateMannerOutput = new CalculateMannerOutputService();
    this.CalculateCropsSnsAnalysisService =
      new CalculateCropsSnsAnalysisService();
    this.CalculatePreviousCropService = new CalculatePreviousCropService();
  }

  async getCropPreCalculationData(
    crop,
    fieldID,
    fieldRelatedData,
    newOrganicManure,
    transactionalManager,
    request,
    crops,
  ) {
    const prefetchContext = fieldRelatedData?._prefetchContext ?? null;
    const snsAnalysesData =
      await this.CalculateCropsSnsAnalysisService.getCropsSnsAnalyses(
        transactionalManager,
        fieldID,
        crop.Year,
        crops,
        prefetchContext?.snsAnalysesByCropId,
      );
    let latestSoilAnalysis;
    let soilAnalysisRecords;
    if (prefetchContext?.soilAnalysisCache) {
      latestSoilAnalysis = prefetchContext.soilAnalysisCache.latestSoilAnalysis;
      soilAnalysisRecords =
        prefetchContext.soilAnalysisCache.soilAnalysisRecords;
    } else {
      const soilAnalysisResult =
        await this.HandleSoilAnalysisService.handleSoilAnalysisValidation(
          fieldID,
          crop.Year,
          fieldRelatedData.RB209CountryID,
          transactionalManager,
        );
      latestSoilAnalysis = soilAnalysisResult.latestSoilAnalysis;
      soilAnalysisRecords = soilAnalysisResult.soilAnalysisRecords;
      if (prefetchContext) {
        prefetchContext.soilAnalysisCache = soilAnalysisResult;
      }
    }

    const mannerOutputs =
      await this.CalculateMannerOutput.calculateMannerOutputForOrganicManure(
        crop,
        newOrganicManure,
        fieldRelatedData,
        fieldRelatedData,
        transactionalManager,
        request,
        crops,
      );

    const previousCrop =
      await this.CalculatePreviousCropService.findPreviousCrop(
        fieldID,
        crop.Year,
        transactionalManager,
        prefetchContext,
      );
    return {
      snsAnalysesData,
      latestSoilAnalysis,
      soilAnalysisRecords,
      mannerOutputs,
      previousCrop,
    };
  }
}
module.exports = { HanldeMannerAndAnalysis };
