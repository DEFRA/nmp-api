const boom = require("@hapi/boom");
const { UserExtensionService } = require("./user-extension.service");

class UserExtensionController {
  #request;
  #h;
  #userExtensionService;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#userExtensionService = new UserExtensionService();
  }

  async updateIsTermsOfUseAccepted() {
    const userId = this.#request.userId;
    const body = this.#request.payload;

    try {
      const updatedIsTermsOfUseAccepted =
        await this.#userExtensionService.updateIsTermsOfUseAccepted(
          body,
          userId
        );
      return this.#h.response({ UserExtension: updatedIsTermsOfUseAccepted });
    } catch (error) {
      return this.#h.response({ error });
    }
  }
  async updateDoNotShowAboutThisService() {
    const userId = this.#request.userId;
    const body = this.#request.payload;

    try {
      const updatedDoNotShowAboutThisService =
        await this.#userExtensionService.updateDoNotShowAboutThisService(
          body,
          userId
        );
      return this.#h.response({ UserExtension: updatedDoNotShowAboutThisService});
    } catch (error) {
      return this.#h.response({ error });
    }
  }
}

module.exports = { UserExtensionController };
