const boom = require("@hapi/boom");
const { CountryService } = require("./country.service");

class CountryController {
  #request; //In JavaScript, the # symbol is used to denote private fields and methods within a class
  #h;
  #countryService;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#countryService = new CountryService();
  }

  async getAll() {
    try {
      const { records } = await this.#countryService.getAll();
      return this.#h.response({ Countries: records });
    } catch (error) {
      console.error(error);
      return this.#h.response({ error });
    }
  }
}

module.exports = { CountryController };
