
const { SoilTypeSoilTextureService } = require("./soil-type-soil-texture.service");

class SoilTypeSoilTextureController {
  #request;
  #h;
  #soilTypeSoilTextureService;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#soilTypeSoilTextureService = new SoilTypeSoilTextureService();
  }

  async getTopSoilSubSoilBySoilTypeId() {
    const { soilTypeId } = this.#request.params;
    try {
      const records  =
        await this.#soilTypeSoilTextureService.getTopSoilSubSoilBySoilTypeId(
          soilTypeId
        );
      return this.#h.response({ SoilTypeSoilTexture: records });
    } catch (error) {
      return this.#h.response({ error });
    }
  }
}
module.exports = { SoilTypeSoilTextureController };
