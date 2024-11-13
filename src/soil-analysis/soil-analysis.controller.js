const { SoilAnalysesService } = require("./soil-analysis.service");

class SoilAnalysesController {
  #request;
  #h;
  #soilAnalysisService;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#soilAnalysisService = new SoilAnalysesService();
  }

  async getSoilAnalysisById() {
    const { soilAnalysisId } = this.#request.params;
    try {
      const { records } = await this.#soilAnalysisService.getById(
        soilAnalysisId
      );
      return this.#h.response({ SoilAnalysis: records });
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getSoilAnalysesByFieldId() {
    const { fieldId } = this.#request.params;
    const { shortSummary } = this.#request.query;
    let selectOptions = {};
    if (shortSummary) selectOptions = { ID: true, Date: true, FieldID: true };
    try {
      const SoilAnalyses = await this.#soilAnalysisService.getBy(
        "FieldID",
        fieldId,
        selectOptions
      );
      return this.#h.response({ SoilAnalyses });
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async createSoilAnalysis() {
    const soilAnalysisBody = this.#request.payload.SoilAnalysis;
    const userId = this.#request.userId;

    try {
      const data = await this.#soilAnalysisService.createSoilAnalysis(
        soilAnalysisBody,
        userId
      );
      return this.#h.response({ SoilAnalysis: data });
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async updateSoilAnalysis() {
    const { soilAnalysisId } = this.#request.params;
    const updatedSoilAnalysisData = this.#request.payload.SoilAnalysis;
    const userId = this.#request.userId;

    try {
      const updatedSoilAnalysis =
        await this.#soilAnalysisService.updateSoilAnalysis(
          updatedSoilAnalysisData,
          userId,
          parseInt(soilAnalysisId)
        );

      return this.#h.response({ soilAnalysis: updatedSoilAnalysis });
    } catch (error) {
      return this.#h.response({ error });
    }
  }
}
module.exports = { SoilAnalysesController };
