const { MannerCropTypeService } = require("./manner-crop-type.service");

class MannerCropTypeController {
  #request;
  #h;
  #mannerCropTypeService;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#mannerCropTypeService = new MannerCropTypeService();
  }

  async getMannerCropTypesByCropTypeID() {
    const { cropTypeID } = this.#request.params;
    try {
      const records =
        await this.#mannerCropTypeService.getMannerCropTypesByCropTypeID(
          cropTypeID
        );
      return this.#h.response({ MannerCropTypes: records });
    } catch (error) {
      console.error("Error fetching Manner Crop Types:", error);
      return this.#h
        .response({ error });
    }
  }
}

module.exports = { MannerCropTypeController };
