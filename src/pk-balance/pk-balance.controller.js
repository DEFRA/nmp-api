const { PKBalanceService } = require("./pk-balance.service");
const { AppDataSource } = require("../db/data-source");

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
        userId,
        AppDataSource.manager
      );
      return this.#h.response({ PKBalance: data });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      const response = {
        error: error.message,
        code: error.code || "INTERNAL_SERVER_ERROR",
      };
      return this.#h.response(response).code(statusCode);
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
        Number.parseInt(pKBalanceId, 10),
        AppDataSource.manager
      );

      return this.#h.response({ PKBalance: updatedPKBalanceData });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      const response = {
        error: error.message,
        code: error.code || "INTERNAL_SERVER_ERROR",
      };
      return this.#h.response(response).code(statusCode);
    }
  }

  async getPKBalanceByYearAndFieldId() {
    const { year } = this.#request.params;
    const { fieldId } = this.#request.query;

    try {
      const PkBalances =
        await this.#PKBalanceService.getPKBalanceByYearAndFieldId(
          year,
          fieldId
        );
      return this.#h.response({ PkBalances });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      const response = {
        error: error.message,
        code: error.code || "INTERNAL_SERVER_ERROR",
      };
      return this.#h.response(response).code(statusCode);
    }
  }
}
module.exports = { PKBalanceController };
