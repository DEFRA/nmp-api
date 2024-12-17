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
      const { fieldId } = this.#request.params;
    const { year } = this.#request.query; 
    
    try {
      const exists =
        await this.#inprogressCalculationsService.checkFarmExistsInCalculations(
          fieldId,
          year
        );
        if (exists) {
         
          return this.#h.response(exists);
        } else {
          
          return this.#h.response(exists);
        }
    } catch (error) {
      return this.#h.response({ error });
    }
  }
}
module.exports = { InprogressCalculationsController };
