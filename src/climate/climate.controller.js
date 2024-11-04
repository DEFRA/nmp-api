const { ClimateService } = require("./climate.service");
const boom = require("@hapi/boom");

class ClimateController {
  #request; //In JavaScript, the # symbol is used to denote private fields and methods within a class
  #h;
  #climateService;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#climateService = new ClimateService();
  }

  async getRainfallAverageByPostcode() {
    const { postcode } = this.#request.params;
    try {
      const records = await this.#climateService.getRainfallAverageByPostcode(
        postcode
      );
      return this.#h.response(records);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getTotalRainfallByPostcodeAndDate() {
    const { postCode, startDate, endDate } = this.#request.query;
    try {
      const records =
        await this.#climateService.getTotalRainfallByPostcodeAndDate(
          postCode,
          startDate,
          endDate
        );
      return this.#h.response(records);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getAllDataByPostcode() {
    const { postcode } = this.#request.params;
    try {
      const { records } = await this.#climateService.getBy(
        "PostCode",
        postcode
      );
      if (records.length === 0) {
        throw boom.notFound("Postcode not found");
      }

      return this.#h.response({ records: records });
    } catch (error) {
      console.error("Error fetching all data by postcode:", error);
      return this.#h.response({ error });
    }
  }
}

module.exports = { ClimateController };
