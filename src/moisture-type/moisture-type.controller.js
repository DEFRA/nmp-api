const { MoistureTypeService } = require("./moisture-type.service");

class MoistureTypeController {
  #request;
  #h;
  #moistureTypeService;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#moistureTypeService = new MoistureTypeService();
  }

  async getSoilMoistureTypes() {
    try {
      const { records } = await this.#moistureTypeService.getAll();
      return this.#h.response({ MoistureTypes: records });
    } catch (error) {
      console.error("Error fetching moisture types:", error);
      return this.#h.response({ error });
    }
  }

  async getDefaultSoilMoistureType() {
    const { date } = this.#request.params;
    try {
      const records =
        await this.#moistureTypeService.getDefaultSoilMoistureType(
          date,
          this.#request
        );
      return this.#h.response({ MoistureType: records });
    } catch (error) {
      console.error("Error fetching moisture type:", error);
      return this.#h.response({ error });
    }
  }
}

module.exports = { MoistureTypeController };
