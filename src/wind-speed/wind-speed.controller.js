const { WindspeedService } = require("./wind-speed.service");

class WindspeedController {
  #request;
  #h;
  #windSpeedService;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#windSpeedService = new WindspeedService();
  }

  async findFirstRow() {
    try {
      const records = await this.#windSpeedService.findFirstRow(this.#request);
      return this.#h.response(records);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async findAll() {
    try {
      const { records } = await this.#windSpeedService.getAll();
      return this.#h.response({ records });
    } catch (error) {
      return this.#h.response({ error });
    }
  }
}
module.exports = { WindspeedController };
