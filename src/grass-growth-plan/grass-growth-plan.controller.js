
const { GrassGrowthService } = require("./grass-growth-plan.service");

class GrassGrowthController {
  #request;
  #h;
  #grassGrowthService;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#grassGrowthService = new GrassGrowthService();
  }

  async getGrassGrowthClass() {
    const { fieldIds } = this.#request.payload; // Extract fieldIds from payload


    try {
      const record =
        await this.#grassGrowthService.getGrassGrowthClassByFieldId(
          fieldIds,
          this.#request
        );
      return this.#h.response(record); // Ensure success response
    } catch (error) {
      return this.#h.response({ error: error.message || "Internal Server Error" })
    }
  }
}

module.exports = { GrassGrowthController };
