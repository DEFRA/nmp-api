const { StaticStrings } = require("../shared/static.string");
const { ScotlandNmaxValueService } = require("./scotland-nmax-values.service");
const boom = require("@hapi/boom");

class ScotlandNMaxValueController {
  #h;
  #scotlandNMaxValuesService;

  constructor(request, h) {
    this.#h = h;
    this.#scotlandNMaxValuesService = new ScotlandNmaxValueService();
  }
    async getAll() {        
        try {
          const record = await this.#scotlandNMaxValuesService.getAll();
          if (!record) {
            throw boom.notFound("No data found.");
          }
          return this.#h.response(  record );
        } catch (error) {
          return this.#h.response({ error });
        }
      }
}

module.exports = { ScotlandNMaxValueController };