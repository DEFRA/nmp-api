
const { GrassTypicalCutsService } = require("./grassTypicalCuts.service");

class GrassTypicalCutsController {
  #request;
  #h;
  #GrassTypicalCutsService;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#GrassTypicalCutsService = new GrassTypicalCutsService();
  }

  async findAll() {
    try {
      const records = await this.#GrassTypicalCutsService.getAll();
      return this.#h.response(records);
    } catch (error) {
      return this.#h.response({ error });
    }
  }
}
module.exports = { GrassTypicalCutsController };
