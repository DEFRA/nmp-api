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
    const { countryID } = this.#request.query;
    try {
      const record =
        await this.#cropTypeLinkingsService.getCropInfoQuestionsByCropTypeID(
          cropTypeID,countryID
        );
    
      return this.#h.response({ CropTypeQuestion: record });
    } catch (error) {
      return this.#h.response({ error });
    }
  }
  async getCropTypeLinking() {
    try {
      const CropTypeLinking =
        await this.#cropTypeLinkingsService.getAll(          
        );
      if (!CropTypeLinking) {
        throw boom.notFound(
          "No CropTypeLinking Data found"
        );
      }
      return this.#h.response({ CropTypeLinking });
    } catch (error) {
      return this.#h.response({ error });
    }
  }
  async getScotlandNmaxByCropTypeID() {
    const { cropTypeId } = this.#request.params;
    const { soilTypeId,residueGroup } = this.#request.query;
    try {
      const record =
        await this.#cropTypeLinkingsService.getScotlandNmaxByCropTypeID(
          cropTypeId,soilTypeId,residueGroup
        );
    
      return this.#h.response({ ScotlandNMax: record });
    } catch (error) {
      return this.#h.response({ error });
    }
  }
}

module.exports = { CropTypeLinkingsController };
