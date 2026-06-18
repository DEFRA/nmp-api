const {
  MannerEstimationApplicationsService,
} = require("./manner-estimation-applications.service");

class MannerEstimationApplicationsController {
  #request;
  #h;
  #mannerEstimationApplicationsService;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#mannerEstimationApplicationsService =
      new MannerEstimationApplicationsService();
  }

  async createMannerEstimationApplication() {
    try {
      const payload = this.#request.payload;
      const userId = this.#request.userId;

      const result = await this.#mannerEstimationApplicationsService.createMannerEstimationApplication(
          payload,
          userId
        );

      return this.#h.response({MannerEstimationApplication: result})
      
    } catch (error) {
      console.error("Error creating Manner Estimation Application:", error);
      return this.#h.response({ error })
    }
  }
}

module.exports = { MannerEstimationApplicationsController };
