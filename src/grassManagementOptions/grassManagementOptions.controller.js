const { GrassManagementOptionsService } = require("./grassManagementOptions.service");


class GrassManagementOptionsController {
  #request;
  #h;
  #GrassManagementOptionsService;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#GrassManagementOptionsService = new GrassManagementOptionsService();
  }

  async findAll() {
    try {
      const  records  = await this.#GrassManagementOptionsService.getAll();
      return this.#h.response( records );
    } catch (error) {
      return this.#h.response({ error });
    }
  }
}
module.exports = { GrassManagementOptionsController };
