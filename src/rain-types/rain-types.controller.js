const { RainTypeService } = require("./rain-types.service");

class RainTypeController {
  #request;
  #h;
  #rainTypeService;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#rainTypeService = new RainTypeService();
  }

  async findFirstRow() {
    try {
      const data = await this.#rainTypeService.findFirstRow(this.#request);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async findAll() {
    try {
      const { records } = await this.#rainTypeService.getAll();
      return this.#h.response({ RainTypes: records });
    } catch (error) {
      return this.#h.response({ error });
    }
  }
}

module.exports = { RainTypeController };
