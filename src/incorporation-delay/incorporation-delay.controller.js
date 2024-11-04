const { IncorporationDelayService } = require("./incorporation-delay.service");
const boom = require("@hapi/boom");

class IncorporationDelayController {
  #request;
  #h;
  #incorporationDelayService;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#incorporationDelayService = new IncorporationDelayService();
  }

  async getIncorporationDelayById() {
    const { id } = this.#request.params;

    try {
      const { records } = await this.#incorporationDelayService.getById(id);
      return this.#h.response({ IncorporationDelay: records });
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getIncorporationDelays() {
    const { methodId } = this.#request.params;
    const { applicableFor } = this.#request.query;
    try {
      const delays =
        await this.#incorporationDelayService.getIncorporationDelays(
          methodId,
          applicableFor
        );

      if (delays.length === 0) {
        throw boom.notFound("No incorporation delay found based on methodId ");
      }
      return this.#h.response({ IncorporationDelays: delays });
    } catch (error) {
      return this.#h.response({ error });
    }
  }
}

module.exports = { IncorporationDelayController };
