const { SiteClassService } = require("./site-class.service");

class SiteClassController {
  #request;
  #h;
  #siteClassService;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#siteClassService = new SiteClassService();
  }

  async getSiteClassId() {
    const { fieldIds } = this.#request.payload;

    try {
      const records = await this.#siteClassService.getSiteClassIdByFieldId(
        fieldIds,
        this.#request,
      );

      return this.#h.response(records);
    } catch (error) {
      return this.#h.response({
        error: error.message || "Internal Server Error",
      });
    }
  }
}

module.exports = { SiteClassController };
