const {
  IncorporationMethodService,
} = require("./incorporation-method.service");
const boom = require("@hapi/boom");

class IncorporationMethodController {
  #request;
  #h;
  #incorporationMethodService;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#incorporationMethodService = new IncorporationMethodService();
  }

  async getIncorporationMethodById() {
    const { id } = this.#request.params;
    try {
      const { records } = await this.#incorporationMethodService.getById(id);
      return this.#h.response({ IncorporationMethod: records });
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getIncorporationMethods() {
    const { appId } = this.#request.params;
    const { applicableFor, fieldType } = this.#request.query;

    try {
      const data =
        await this.#incorporationMethodService.getIncorporationMethods(
          fieldType,
          applicableFor,
          appId
        );
      if (data.length === 0) {
        throw boom.notFound("No Incorporation Method found based on methodId");
      }
      return this.#h.response({ IncorporationMethods: data });
    } catch (error) {
      return this.#h.response({ error });
    }
  }
}

module.exports = { IncorporationMethodController };
