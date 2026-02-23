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
  const { PKBalance } = this.#request.payload;
  const userId = this.#request.userId;

  try {
    const data = await this.#PKBalanceService.createPKBalance(
      PKBalance,
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
        await this.#PKBalanceService.updatePKBalance(
          updatedPKBalanceData,
          userId,
          Number.parseInt(pKBalanceId)
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
      const PkBalances = await this.#PKBalanceService.getPKBalanceByYearAndFieldId(
        year,
        fieldId
      );
      return this.#h.response({ PkBalances });
    } catch (error) {
      return this.#h.response({ error });
    }
  }
}
module.exports = { PKBalanceController };
