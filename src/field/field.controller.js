const { StaticStrings } = require("../shared/static.string");
const { FieldService } = require("./field.service");
const boom = require("@hapi/boom");

class FieldController {
  #request;
  #h;
  #fieldService;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#fieldService = new FieldService();
  }

  async getById() {
    const { fieldId } = this.#request.params;
    try {
      const { records } = await this.#fieldService.getById(fieldId);
      return this.#h.response({ Field: records });
    } catch (error) {
      return this.#h.response({ error });
    }
  }
  async getFieldCropAndSoilDetails() {
    const { fieldId } = this.#request.params;
    const { year, confirm } = this.#request.query;
    try {
      const records = await this.#fieldService.getFieldCropAndSoilDetails(
        fieldId,
        year,
        confirm
      );
      if (!records) {
        throw boom.notFound(StaticStrings.HTTP_STATUS_NOT_FOUND);
      }
      return this.#h.response({ FieldDetails: records });
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getFieldsByFarmId() {
    const { farmId } = this.#request.params;
    const { shortSummary } = this.#request.query;
    let selectOptions = {};
    if (shortSummary) selectOptions = { ID: true, Name: true, FarmID: true };

    try {
      const records =
        (await this.#fieldService.getBy("FarmID", farmId, selectOptions))
          ?.records || [];

      return this.#h.response({ Fields: records });
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getFarmFieldsCount() {
    const { farmId } = this.#request.params;
    try {
      const count = await this.#fieldService.countRecords({ FarmID: farmId });

      return this.#h.response({ count });
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async checkFarmFieldExists() {
    const { farmId } = this.#request.params;
    const { name } = this.#request.query;
    try {
      const exists = await this.#fieldService.checkFieldExists(farmId, name);

      return this.#h.response({ exists });
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async updateField() {
    const { fieldId } = this.#request.params;
    const userId = this.#request.userId;
    const { Field } = this.#request.payload;
    try {
      const updatedField = await this.#fieldService.updateField(
        Field,
        userId,
        fieldId,
        this.#request
      );
      return this.#h.response({ Field: updatedField });
    } catch (error) {
      return this.#h.response({ error });
    }
  }
  async createFieldWithSoilAnalysisAndCrops() {
    const { farmId } = this.#request.params;
    const body = this.#request.payload;
    const userId = this.#request.userId;
    try {
      const data = await this.#fieldService.createFieldWithSoilAnalysisAndCrops(
        farmId,
        body,
        userId
      );
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }
  async deleteFieldById() {
    const { fieldId } = this.#request.params;
    try {
      const result = await this.#fieldService.deleteFieldAndRelatedEntities(
        fieldId
      );
      if (result?.affectedRows === 0) {
        throw boom.notFound(`Field with ID ${fieldId} not found.`);
      }
      return this.#h.response({ message: "Field deleted successfully." });
    } catch (error) {
      return this.#h.response({ error: error.message });
    }
  }
  async getFieldSoilAnalysisAndSnsAnalysis() {
    const { fieldId } = this.#request.params;
    try {
      const records =
        await this.#fieldService.getFieldSoilAnalysisAndSnsAnalysisDetails(
          fieldId
        );
      if (!records) {
        throw boom.notFound(StaticStrings.HTTP_STATUS_NOT_FOUND);
      }
      return this.#h.response({ Records: records });
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getFieldRelatedData() {
    const { fieldId } = this.#request.params;
    const { year } = this.#request.query;

    try {
      // Handle multiple FieldIDs, split by comma if needed (if multiple IDs are passed)
      const fieldIds = fieldId.split(",").map((id) => parseInt(id));

      // Fetch related data for the fields
      const fieldData = await this.#fieldService.getFieldRelatedData(
        fieldIds,
        year,
        this.#request
      );

      // Return the Field objects with related data
      return this.#h.response(fieldData);
    } catch (error) {
      return this.#h.response({ error: error.message }).code(400);
    }
  }

}

module.exports = { FieldController };
