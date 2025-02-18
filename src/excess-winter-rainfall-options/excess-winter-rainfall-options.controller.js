const { ExcessWinterRainFallOptionsService} = require("./excess-winter-rainfall-options.service");

class ExcessRainFallOptionsController {
  #request;
  #h;
  #excessWinterRainFallOptionsService;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#excessWinterRainFallOptionsService =
      new ExcessWinterRainFallOptionsService();
  }

  async findAll() {
    try {
      const { records } =
        await this.#excessWinterRainFallOptionsService.getAll();
      return this.#h.response({ ExcessWinterRainFallOptions: records });
    } catch (error) {
      return this.#h.response({ error });
    }
  }
  async getValueByID() {
    const { Id } = this.#request.params;
    try {
      const excessWinterRainFallOptionValue = await this.#excessWinterRainFallOptionsService.getById(Id);
      return this.#h.response( excessWinterRainFallOptionValue );
    } catch (error) {
      return this.#h.response({ error });
    }
  }
}


module.exports = { ExcessRainFallOptionsController };
