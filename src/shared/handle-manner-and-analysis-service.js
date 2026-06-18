const { CalculateCropsSnsAnalysisService } = require("./calculate-crops-sns-analysis-service");
const { CalculateMannerOutputService } = require("./calculate-manner-output-service");
const { HandleSoilAnalysisService } = require("./handle-soil-analysis");
const { CalculatePreviousCropService } = require("./previous-year-crop-service");

class HanldeMannerAndAnalysis {
  constructor() {
  this.HandleSoilAnalysisService = new HandleSoilAnalysisService();
  this.CalculateMannerOutput = new CalculateMannerOutputService();
  this.CalculateCropsSnsAnalysisService =new CalculateCropsSnsAnalysisService();
  this.CalculatePreviousCropService = new CalculatePreviousCropService();
  }

  async getCropPreCalculationData(
    crop,
    fieldID,
    fieldRelatedData,
    newOrganicManure,
    transactionalManager,
    request
  ) {
    const snsAnalysesData =await this.CalculateCropsSnsAnalysisService.getCropsSnsAnalyses(
        transactionalManager,
        fieldID,
        crop.Year
      );
    const { latestSoilAnalysis, soilAnalysisRecords } = await this.HandleSoilAnalysisService.handleSoilAnalysisValidation(
        fieldID,
        crop.Year,
        fieldRelatedData.RB209CountryID,
        transactionalManager
      );

    const mannerOutputs =
      await this.CalculateMannerOutput.calculateMannerOutputForOrganicManure(
        crop,
        newOrganicManure,
        fieldRelatedData,
        fieldRelatedData,
        transactionalManager,
        request,
      );

     const previousCrop =await this.CalculatePreviousCropService.findPreviousCrop(
         fieldID,
         crop.Year,
         transactionalManager,
       );  
    return {
      snsAnalysesData,
      latestSoilAnalysis,
      soilAnalysisRecords,
      mannerOutputs,
      previousCrop
    };
  }
}
module.exports = { HanldeMannerAndAnalysis };