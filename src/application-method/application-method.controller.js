const { ApplicationMethodService } = require("./application-method.service");

class ApplicationMethodController {
  #request;
  #h;
  #applicationMethodService;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#applicationMethodService = new ApplicationMethodService();
  }
  async getApplicationMethods() {
    const { fieldType, applicableFor } = this.#request.query;
    try {
      const records =
        await this.#applicationMethodService.getApplicationMethods(
          fieldType,
          applicableFor
        );
      return this.#h.response({ ApplicationMethods: records });
    } catch (error) {
      console.error("Error fetching application methods:", error);
      return this.#h.response({ error });
    }
  }

  async getApplicationMethodById() {
    const { id } = this.#request.params;
    try {
      const record =
        await this.#applicationMethodService.getApplicationMethodById(id);
      return this.#h.response({ ApplicationMethod: record });
    } catch (error) {
      console.error(error);
      return this.#h.response({ error });
    }
  }
}

module.exports = { ApplicationMethodController };
