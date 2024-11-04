const { SecondCropLinkingsService } = require("./second-crop-linkings.service");

class SecondCropLinkingsController {
  #request;
  #h;
  #secondCropLinkingsService;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#secondCropLinkingsService = new SecondCropLinkingsService();
  }

  async getSecondCropTypeLinkingByFirstCropId() {
    const { firstCropID } = this.#request.params;
    try {
      const records =
        await this.#secondCropLinkingsService.getSecondCropTypeLinkingByFirstCropId(
          firstCropID
        );
      return this.#h.response({ SecondCropID: records });
    } catch (error) {
      console.error("Error fetching SecondCropTypeLinking:", error);
      return this.#h.response({ error });
    }
  }
}

module.exports = { SecondCropLinkingsController };
