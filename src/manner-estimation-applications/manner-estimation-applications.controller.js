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

      const result =
        await this.#mannerEstimationApplicationsService.createMannerEstimationApplication(
          payload,
          userId,
          this.#request,
        );

      return this.#h.response({ MannerEstimationApplication: result });
    } catch (error) {
      console.error("Error creating Manner Estimation Application:", error);
      return this.#h.response({ error });
    }
  }

  async updateMannerEstimationApplication() {
    try {
      const payload = this.#request.payload;
      const userId = this.#request.userId;

      const result =
        await this.#mannerEstimationApplicationsService.updateMannerEstimationApplication(
          payload,
          userId,
          this.#request,
        );

      return this.#h.response({ MannerEstimationApplication: result });
    } catch (error) {
      console.error("Error updating Manner Estimation Application:", error);
      return this.#h.response({ error });
    }
  }

  async getEstimationApplicationsByEstimationId() {
    try {
      const { mannerEstimationId } = this.#request.params;
      const records =
        await this.#mannerEstimationApplicationsService.getEstimationApplicationsByEstimationId(
          mannerEstimationId,
        );
      return this.#h.response({ MannerEstimationApplications: records });
    } catch (error) {
      console.error("Error in getEstimationApplicationsByEstimationId:", error);
      return this.#h.response(error);
    }
  }

  async fetchTotalNByMannerEstimationIdAppDate() {
    try {
      const { mannerEstimationId } = this.#request.params;
      const { startDate, endDate, mannerApplicationId } = this.#request.query;

      const totalN =
        await this.#mannerEstimationApplicationsService.fetchTotalNByMannerEstimationIdAppDate(
          mannerEstimationId,
          startDate,
          endDate,
          mannerApplicationId,
        );

      return this.#h.response({ TotalN: totalN });
    } catch (error) {
      console.error("Error in fetchTotalNByMannerEstimationIdAppDate:", error);
      return this.#h.response({ error });
    }
  }

  async fetchTotalNBasedByMannerEstimationIdAppDateAndIsGreenCompost() {
    try {
      const { mannerEstimationId } = this.#request.params;
      const { startDate, endDate, isGreenFoodCompost, mannerApplicationId } =
        this.#request.query;

      const totalN =
        await this.#mannerEstimationApplicationsService.fetchTotalNBasedByMannerEstimationIdAppDateAndIsGreenCompost(
          mannerEstimationId,
          startDate,
          endDate,
          isGreenFoodCompost,
          mannerApplicationId,
        );

      return this.#h.response({ TotalN: totalN });
    } catch (error) {
      console.error(
        "Error in fetchTotalNBasedByMannerEstimationIdAppDateAndIsGreenCompost:",
        error,
      );
      return this.#h.response({ error });
    }
  }

  async checkMannerGreenCompostExistanceByDateRange() {
    try {
      const { mannerEstimationId } = this.#request.params;
      const { dateFrom, dateTo, mannerApplicationId } = this.#request.query;

      const exists =
        await this.#mannerEstimationApplicationsService.checkMannerGreenCompostExistanceByDateRange(
          mannerEstimationId,
          dateFrom,
          dateTo,
          mannerApplicationId,
        );

      return this.#h.response({ exists });
    } catch (error) {
      console.error(
        "Error in checkMannerGreenCompostExistanceByDateRange:",
        error,
      );
      return this.#h.response({ error });
    }
  }

  async deleteMannerEstimationApplicationById() {
    const { id } = this.#request.params;
    try {
      await this.#mannerEstimationApplicationsService.deleteMannerEstimationApplication(
        id,
      );
      return this.#h.response({
        message: "Manner estimation application deleted successfully.",
      });
    } catch (error) {
      console.error("Error in deleting manner estimation application:", error);
      return this.#h.response({
        error: error.message,
      });
    }
  }

  async getById() {
    try {
      const { id } = this.#request.params;
      const records =
        await this.#mannerEstimationApplicationsService.getById(id);
      return this.#h.response(records);
    } catch (error) {
      console.error("Error in getById:", error);
      return this.#h.response(error);
    }
  }
}

module.exports = { MannerEstimationApplicationsController };
