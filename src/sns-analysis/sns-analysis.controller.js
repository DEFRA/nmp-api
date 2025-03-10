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
}

module.exports = { SNSAnalysesController };
