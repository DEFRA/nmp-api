const boom = require("@hapi/boom");
const {
  InorganicManureDurationService,
} = require("./inorganic-manure-duration.service");

class InorganicManureDurationController {
  #request;
  #h;
  #inorganicManureDurationService;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#inorganicManureDurationService = new InorganicManureDurationService();
  }

  async getInorganicManureDurations() {
    try {
      const records =
        await this.#inorganicManureDurationService.getInorganicManureDurations();
      return this.#h.response({ InorganicManureDurations: records });
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getInorganicManureDurationById() {
    const { id } = this.#request.params;

    try {
      const { records } = await this.#inorganicManureDurationService.getById(
        id
      );
      return this.#h.response({ InorganicManureDuration: records });
    } catch (error) {
      return this.#h.response({ error });
    }
  }
}

module.exports = { InorganicManureDurationController };
