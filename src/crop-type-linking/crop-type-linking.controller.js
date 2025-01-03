const { CropTypeLinkingsService } = require("./crop-type-linking.service");
const boom = require("@hapi/boom");
class CropTypeLinkingsController {
  #request;
  #h;
  #cropTypeLinkingsService;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#cropTypeLinkingsService = new CropTypeLinkingsService();
  }

  async getCropTypeLinkingByCropTypeID() {
    const { cropTypeID } = this.#request.params;
    try {
      const record =
        await this.#cropTypeLinkingsService.getCropTypeLinkingByCropTypeID(
          cropTypeID
        );
      if (!record) {
        throw boom.notFound(
          "No CropTypeLinking Data found based on CropTypeID"
        );
      }
      return this.#h.response({ CropTypeLinking: record });
    } catch (error) {
      return this.#h.response({ error });
    }
  }
  async getCropInfoQuestionsByCropTypeID() {
    const { cropTypeID } = this.#request.params;
    try {
      const record =
        await this.#cropTypeLinkingsService.getCropInfoQuestionsByCropTypeID(
          cropTypeID
        );
      if (!record) {
        throw boom.notFound(
          "No CropTypeLinking Data found based on CropTypeID"
        );
      }
      return this.#h.response({ CropTypeQuestion: record });
    } catch (error) {
      return this.#h.response({ error });
    }
  }
}

module.exports = { CropTypeLinkingsController };
