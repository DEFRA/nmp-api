const boom = require("@hapi/boom");
const { LogsService } = require("./errorlogs.service");

class LogsController {
  #request;
  #h;
  #logsService;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#logsService = new LogsService();
  }

  async getLogsByDate() {
    const { date } = this.#request.query;

    if (!this.#logsService.validateDate(date)) {
      throw boom.badRequest("Invalid date format. Use YYYY-MM-DD.");
    }

    const result = await this.#logsService.getLogsByDate(date);
    return this.#h.response(result);
  }
}

module.exports = { LogsController };
