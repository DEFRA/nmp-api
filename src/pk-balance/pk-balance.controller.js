const { PKBalanceService } = require("./pk-balance.service");

class PKBalanceController {
    #request;
    #h;
    #PKBalanceService;
  
    constructor(request, h) {
      this.#request = request;
      this.#h = h;
      this.#PKBalanceService = new PKBalanceService();
    }

async createPKBalance() {
  const pKBalanceBody = this.#request.payload.SoilAnalysis;
  const userId = this.#request.userId;

  try {
    const data = await this.#PKBalanceService.createPKBalance(
      pKBalanceBody,
      userId
    );
    return this.#h.response({ PKBalance: data });
  } catch (error) {
    return this.#h.response({ error });
  }
  }

  async updatePKBalance() {
    const { pKBalanceId } = this.#request.params;
    const updatedPKBalanceData = this.#request.payload.PKBalance;
    const userId = this.#request.userId;

    try {
      const updatedPKBalance=
        await this.#PKBalanceService.updatePKBalance(
          updatedPKBalanceData,
          userId,
          parseInt(pKBalanceId)
        );

      return this.#h.response({ PKBalance: updatedPKBalanceData });
    } catch (error) {
      return this.#h.response({ error });
    }
  }
  async getPKBalanceByYearAndFieldId() {
    const { year } = this.#request.params;
    const { fieldId } = this.#request.query;
    //let selectOptions = {};
    //if (shortSummary) selectOptions = { ID: true, Date: true, FieldID: true };
    try {
      const PkBalances = await this.#PKBalanceService.getBy(
        "Year",
        year,
        fieldId
      );
      return this.#h.response({ PkBalances });
    } catch (error) {
      return this.#h.response({ error });
    }
  }
}