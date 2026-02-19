const { StaticStrings } = require("../shared/static.string");
const boom = require("@hapi/boom");
const { FarmsNVZService } = require("./farms-NVZ.service");

class FarmsNVZController {
  #request;
  #h;
  #farmNVZService;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#farmNVZService = new FarmsNVZService();
  }
    async getByFarmId() {
    const {farmId} = this.#request.params;
    try {
      console.log('farmID123',farmId)
      const { records } = await this.#farmNVZService.getBy("FarmID",farmId);
      return this.#h.response({ FarmsNVZ: records });
    } catch (error) {
      return this.#h.response({ error });
    }
  }
}

module.exports = { FarmsNVZController };