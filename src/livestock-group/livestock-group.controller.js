const { LivestockGroupService } = require("./livestock-group.service");

class LivestockGroupController {
  #request;
  #h;
  #livestockGroupService;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#livestockGroupService = new LivestockGroupService();
  }

  async getAllLivestockGroups() {
    try {
      const { records } = await this.#livestockGroupService.getAll();
      return this.#h.response({ LivestockGroups: records });
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getLivestockGroupBylivestockGroupId() {
    const { livestockGroupId } = this.#request.params;
    try {
      const { records } = await this.#livestockGroupService.getById(livestockGroupId);
      return this.#h.response({ livestockGroup: records });
    } catch (error) {
      return this.#h.response({ error });
    }
  }
}
module.exports = { LivestockGroupController };
