
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
    const { harvestYear } = this.#request.params; // Extract harvestYear from params

    try {
      const record =
        await this.#grassGrowthService.getGrassGrowthClassByFieldId(
          fieldIds,
          harvestYear,
          this.#request
        );
      return this.#h.response(record).code(200); // Ensure success response
    } catch (error) {
      return this.#h
        .response({ error: error.message || "Internal Server Error" })
        .code(500);
    }
  }
}

module.exports = { GrassGrowthController };
