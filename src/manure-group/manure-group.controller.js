const { ManureGroupService } = require("./manure-group.service");

class ManureGroupController {
  #request;
  #h;
  #manureGroupService;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#manureGroupService = new ManureGroupService();
  }

  async getAllManureGroups() {
    try {
      const { records } = await this.#manureGroupService.getAll();
      return this.#h.response({ ManureGroups: records });
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getManureGroupByManureGroupId() {
    const { manureGroupId } = this.#request.params;
    try {
      const { records } = await this.#manureGroupService.getById(manureGroupId);
      return this.#h.response({ ManureGroup: records });
    } catch (error) {
      return this.#h.response({ error });
    }
  }
}
module.exports = { ManureGroupController };
