const { WarningMessageService } = require("./warning-message.service");

class WarningMessageController {
  #request;
  #h;
  #WarningMessageService;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#WarningMessageService = new WarningMessageService();
  }

  
  async getWarningMessageByFieldIdAndYear() {
    const { fieldId } = this.#request.params;
    const { harvestYear } = this.#request.query;

    try {
      // Handle multiple FieldIDs, split by comma if needed (if multiple IDs are passed)
      const fieldIds = fieldId.split(",").map((id) => Number.parseInt(id));

      const result =
        await this.#WarningMessageService.getWarningMessageByFieldIdsAndYear(
          fieldIds,harvestYear
        );
      return this.#h.response(result);
    } catch (error) {
      return this.#h.response({ error: error.message }).code(400);
    }
  }

  
}

module.exports = { WarningMessageController };