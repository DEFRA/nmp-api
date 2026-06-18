const { WarningService } = require("./warning.service");

class WarningController {
  #request;
  #h;
  #WarningService;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#WarningService = new WarningService();
  }

  async getAll() {
    try {
      const records = await this.#WarningService.getAll();
      return this.#h.response(records);
    } catch (error) {
      console.error("Error in getAll:", error);
      return this.#h.response(error);
    }
  }

  async getWarningMessageByCountryIdAndKey() {
    const { CountryID } = this.#request.params;
    const { WarningKey } = this.#request.query;
    try {
      const result =
        await this.#WarningService.getWarningMessageByCountryAndKey(
          CountryID,
          WarningKey
        );
      return this.#h.response(result);
    } catch (error) {
      return this.#h.response(error);
    }
  }
}

module.exports = { WarningController };
