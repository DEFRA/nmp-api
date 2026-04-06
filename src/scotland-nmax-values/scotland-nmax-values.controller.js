const { StaticStrings } = require("../shared/static.string");
const { ScotlandNmaxValueService } = require("./scotland-nmax-values.service");
const boom = require("@hapi/boom");

class ScotlandNMaxValueController {
  #request;
  #h;
  #scotlandNMaxValueService;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#scotlandNMaxValueService = new ScotlandNmaxValueService();
  }
    async getAll() {        
        try {
          const record = await this.#scotlandNMaxValueService.getAll();
          if (!record) {
            throw boom.notFound("No data found.");
          }
          return this.#h.response({  record });
        } catch (error) {
          return this.#h.response({ error });
        }
      }
}

module.exports = { ScotlandNMaxValueController };