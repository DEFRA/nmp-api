const { SnsAnalysisService } = require("./sns-analysis.service");

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

  async updateSNSAnalysis() {
    const { snsAnalysisId } = this.#request.params;
    const updatedSNSAnalysisData = this.#request.payload.SNSAnalysis;
    const userId = this.#request.userId;
    const pKBalanceData = this.#request.payload.PKBalance;

    try {
      const data = await this.#snsAnalysisService.updateSNSAnalysis(
        updatedSNSAnalysisData,
        userId,
        parseInt(snsAnalysisId),
        pKBalanceData,
        this.#request
      );

      return this.#h.response({ data });
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async deleteSNSAnalysisById() {
    const { snsAnalysisId } = this.#request.params;
    const userId = this.#request.userId;
    try {
      const result = await this.#snsAnalysisService.deleteSNSAnalysis(
        snsAnalysisId,
        userId,
        this.#request
      );
      if (result?.affectedRows === 0) {
        throw boom.notFound(`SNS analysis with ID ${snsAnalysisId} not found.`);
      }
      return this.#h.response({
        message: "SNS analysis deleted successfully.",
      });
    } catch (error) {
      return this.#h.response({ error: error.message });
    }
  }
}

module.exports = { SNSAnalysesController };
