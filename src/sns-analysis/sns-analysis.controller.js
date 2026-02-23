const { SnsAnalysisService } = require("./sns-analysis.service");
const boom = require("@hapi/boom");

class SNSAnalysesController {
  #request;
  #h;
  #snsAnalysisService;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#snsAnalysisService = new SnsAnalysisService();
  }

  async getSNSAnalysesByCropId() {
    const { cropId } = this.#request.params;
    let selectOptions = {};
    try {
      const snsAnalyses = await this.#snsAnalysisService.getBy(
        "CropID",
        cropId,
        selectOptions
      );
      return this.#h.response({ snsAnalyses });
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async createSnsAnalysis() {
    const snsAnalysisBody = this.#request.payload;
    const userId = this.#request.userId;

    try {
      const data = await this.#snsAnalysisService.createSnsAnalysis(
        snsAnalysisBody,
        userId,
        this.#request
      );
      return this.#h.response({ data });
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async deleteSnsAnalysisById() {
    const { snsAnalysisId } = this.#request.params;
    const userId = this.#request.userId;
    try {
      const result = await this.#snsAnalysisService.deleteSnsAnalysis(
        snsAnalysisId,
        userId,
        this.#request
      );
      if (result?.affectedRows === 0) {
        throw boom.notFound(`Snsanalysis with ID ${snsAnalysisId} not found.`);
      }
      return this.#h.response({
        message: "Snsanalysis deleted successfully.",
      });
    } catch (error) {
      return this.#h.response({ error: error.message });
    }
  }

  async updateSnsAnalysis() {
    const { snsAnalysisId } = this.#request.params;
    const updatedSnsAnalysisData = this.#request.payload;
    const userId = this.#request.userId;
  
console.log("updatedSnsAnalysisData", updatedSnsAnalysisData);
    try {
      const data = await this.#snsAnalysisService.updateSnsAnalysis(
        updatedSnsAnalysisData,
        userId,
        Number.parseInt(snsAnalysisId),
        this.#request
      );

      return this.#h.response({ data });
    } catch (error) {
      return this.#h.response({ error });
    }
  }
}

module.exports = { SNSAnalysesController };
