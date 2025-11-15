const { PreviousCroppingService } = require("./previous-cropping.service");

class PreviousCroppingController {
  #request;
  #h;
  #PreviousCroppingService;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#PreviousCroppingService = new PreviousCroppingService();
  }

  async getPreviousCroppingDataByFieldIdAndYear() {
    const { fieldId } = this.#request.params;
    const { year } = this.#request.query;

    try {
      console.log("fieldId123", fieldId);
      // Previous croppping related data for the field
      const result =
        await this.#PreviousCroppingService.getPreviousCroppingDataByFieldIdAndYear(
          fieldId,
          year ?? null
        );

      // Return the Previous croppping objects with related data
      return this.#h.response(result);
    } catch (error) {
      return this.#h.response({ error: error.message }).code(400);
    }
  }
  async getPreviousCroppingPreviousYearsDataByFieldIdAndYear() {
    const { fieldId } = this.#request.params;
    const { year } = this.#request.query;

    try {
     
      // Previous croppping related data for the field
      const result =
        await this.#PreviousCroppingService.getPreviousCroppingPreviousYearsDataByFieldIdAndYear(
          fieldId,
          year ?? null
        );

      // Return the Previous croppping objects with related data
      return this.#h.response(result);
    } catch (error) {
      return this.#h.response({ error: error.message }).code(400);
    }
  }

  async getOldestPreviousCroppingYearByFarmId() {
    const { farmId } = this.#request.params;

    try {
     const BAD_REQUEST = 400;
      // Previous croppping related data for the field
      const result =
        await this.#PreviousCroppingService.getOldestPreviousCroppingYearByFarmId(
          farmId
        );

      // Return the Previous croppping objects with related data
      return this.#h.response(result);
    } catch (error) {
      return this.#h.response({ error: error.message }).code(BAD_REQUEST);
    }
  }

  async mergePreviousCropping() {
    const { PreviousCroppings } = this.#request.payload;
    const userId = this.#request.userId;

    try {
      const data = await this.#PreviousCroppingService.mergePreviousCropping(
        PreviousCroppings,
        userId,
        this.#request
      );
      return this.#h.response({ PreviousCropping: data });
    } catch (error) {
      return this.#h.response({ error });
    }
  }
}

module.exports = { PreviousCroppingController };