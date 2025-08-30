const { LivestockTypeService } = require("./livestock-type.service");

class LivestockTypeController {
  #request;
  #h;
  #livestockTypeService;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#livestockTypeService = new LivestockTypeService();
  }

  async getAllLivestockTypes() {
    try {
      const { records } = await this.#livestockTypeService.getAll();
      return this.#h.response({ LivestockTypes: records });
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getLivestockTypeById() {
    try {
      const { records } = await this.#livestockTypeService.getById();
      return this.#h.response({ LivestockTypes: records });
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getLivestockTypesBylivestockGroupId() {
    const { livestockGroupId } = this.#request.params;
    try {
      const { LivestockTypes } = await this.#livestockTypeService.getLivestockTypesByLivestockGroupId(livestockGroupId);
      return this.#h.response({ livestockTypes: LivestockTypes });
    } catch (error) {
      return this.#h.response({ error });
    }


  }
}
module.exports = { LivestockTypeController };
