const {
  MannerFinancialValuesService,
} = require("./manner-financial-values.service");

class MannerFinancialValuesController {
  #request;
  #h;
  #mannerFinancialValuesService;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#mannerFinancialValuesService = new MannerFinancialValuesService();
  }

  async createMannerFinancialValues() {
    try {
      const payload = this.#request.payload;
      const userId = this.#request.userId;

      const result =
        await this.#mannerFinancialValuesService.createMannerFinancialValues(
          payload,
          userId,
        );

      return this.#h.response({ MannerFinancialValues: result });
    } catch (error) {
      console.error("Error creating Manner Financial Values:", error);
      return this.#h.response({ error });
    }
  }
}

module.exports = { MannerFinancialValuesController };
