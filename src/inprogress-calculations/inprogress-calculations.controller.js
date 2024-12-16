const { InprogressCalculationsService } = require("./inprogress-calculations.service");


class InprogressCalculationsController {
  #request;
  #h;
  #inprogressCalculationsService;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#inprogressCalculationsService = new InprogressCalculationsService();
  }

  async getInprogressCalculationsByFarmID() {
    const { farmId } = this.#request.params;
    
    try {
      const exists =
        await this.#inprogressCalculationsService.checkFarmExistsInCalculations(
          farmId
        );
        if (exists) {
          // If the farm exists, return a success response with the farmId
          return this.#h.response(exists);
        } else {
          // If the farm doesn't exist, return a not found response
          return this.#h.response(exists);
        }
    } catch (error) {
      return this.#h.response({ error });
    }
  }
}
module.exports = { InprogressCalculationsController };
