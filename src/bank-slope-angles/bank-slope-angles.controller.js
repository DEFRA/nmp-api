const { BankSlopeAnglesService } = require("./bank-slope-angles.service");

class BankSlopeAnglesController {
  #request;
  #h;
  #service;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#service = new BankSlopeAnglesService();
  }

  async getAll() {
    try {
      const records = await this.#service.getAll();
      return this.#h.response(records);
    } catch (error) {
      console.error("Error in getAll:", error);
      return this.#h.response(error);
    }
  }

  async getById() {
    const { id } = this.#request.params;
    try {
      const record = await this.#service.getById(id);
      return this.#h.response(record);
    } catch (error) {
      console.error("Error in getById:", error);
      return this.#h.response(error);
    }
  }
}

module.exports = { BankSlopeAnglesController };
