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
const pKBalanceData=this.#request.payload.PKBalance;
    try {
      const data = await this.#soilAnalysisService.createSoilAnalysis(
        soilAnalysisBody,
        userId,
        pKBalanceData,
        this.#request
      );
      return this.#h.response({  data });
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async updateSoilAnalysis() {
    const { soilAnalysisId } = this.#request.params;
    const updatedSoilAnalysisData = this.#request.payload.SoilAnalysis;
    const userId = this.#request.userId;
    const pKBalanceData = this.#request.payload.PKBalance;

    try {
      const data = await this.#soilAnalysisService.updateSoilAnalysis(
        updatedSoilAnalysisData,
        userId,
        parseInt(soilAnalysisId),
        pKBalanceData,
        this.#request
      );

      return this.#h.response({ data });
    } catch (error) {
      return this.#h.response({ error });
    }
  }
  async deleteSoilAnalysisById() {
      const { soilAnalysisId } = this.#request.params;
      const userId = this.#request.userId;
      try {
        const result = await this.#soilAnalysisService.deleteSoilAnalysis(
          soilAnalysisId,
          userId,
          this.#request
        );
        if (result?.affectedRows === 0) {
          throw boom.notFound(`Soilanalysis with ID ${soilAnalysisId} not found.`);
        }
        return this.#h.response({ message: "Soilanalysis deleted successfully." });
      } catch (error) {
        return this.#h.response({ error: error.message });
      }
    }
}
module.exports = { SoilAnalysesController };
