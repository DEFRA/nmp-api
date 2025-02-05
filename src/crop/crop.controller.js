const { StaticStrings } = require("../shared/static.string");
const PlanService = require("../plan/plan.service");
const { CropService } = require("./crop.service");
const boom = require("@hapi/boom");

class CropController {
  #request;
  #h;
  #cropService;
  #planService;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#cropService = new CropService();
    this.#planService = new PlanService();
  }

  async getCropsPlansByHarvestYear() {
    try {
      const { harvestYear } = this.#request.params;
      const { farmId } = this.#request.query;

      const plans = await this.#planService.getPlansByHarvestYear(
        farmId,
        harvestYear
      );

      if (plans.length === 0) {
        throw boom.notFound(StaticStrings.HTTP_STATUS_NOT_FOUND);
      }

      return this.#h.response(plans);
    } catch (error) {
      console.error("Error in getCropsPlansByHarvestYear controller:", error);
      return this.#h.response({ error });
    }
  }

  async getCropsPlansCropTypesByHarvestYear() {
    try {
      const { harvestYear } = this.#request.params;
      const { farmId } = this.#request.query;

      const cropTypes =
        await this.#planService.getCropsPlansCropTypesByHarvestYear(
          farmId,
          harvestYear
        );
      if (cropTypes.length === 0) {
        throw boom.notFound(StaticStrings.HTTP_STATUS_NOT_FOUND);
      }
      return this.#h.response(cropTypes);
    } catch (error) {
      console.error(
        "Error in getCropsPlansCropTypesByHarvestYear controller:",
        error
      );
      return this.#h.response({ error });
    }
  }
  async getCropsPlansManagementPeriodIdsByHarvestYear() {
    try {
      const { harvestYear } = this.#request.params;
      const { cropTypeId, fieldIds, cropOrder } = this.#request.query;

      const managementPeriodIds =
        await this.#planService.getCropsPlansManagementPeriodIds(
          fieldIds,
          harvestYear,
          cropTypeId,
          cropOrder
        );
      if (managementPeriodIds.ManagementPeriods.length === 0) {
        throw boom.notFound(StaticStrings.HTTP_STATUS_NOT_FOUND);
      }

      return this.#h.response(managementPeriodIds);
    } catch (error) {
      console.error(
        "Error in getCropsPlansManagementPeriodIdsByHarvestYear controller:",
        error
      );
      return this.#h.response({ error });
    }
  }

  async getCropsPlansFieldsByHarvestYearAndCropTypeId() {
    try {
      const { harvestYear } = this.#request.params;
      const { farmId, cropTypeId } = this.#request.query;

      const plans = await this.#planService.getCropsPlanFields(
        farmId,
        harvestYear,
        cropTypeId
      );
      if (plans.length === 0) {
        throw boom.notFound(StaticStrings.HTTP_STATUS_NOT_FOUND);
      }
      return this.#h.response(plans);
    } catch (error) {
      console.error(
        "Error in getCropsPlansFieldsByHarvestYearAndCropTypeId controller:",
        error
      );
      return this.#h.response({ error });
    }
  }

  async getCropsByFieldId() {
    try {
      const { fieldId } = this.#request.params;

      const Crops = await this.#cropService.getBy("FieldID", fieldId);

      return this.#h.response({ Crops });
    } catch (error) {
      console.error("Error in getCropsByFieldId controller:", error);
      return this.#h.response({ error });
    }
  }

  async getCropsPlansByFarmId() {
    try {
      const { farmId } = this.#request.query;
      const { type } = this.#request.query;

      const confirm = !!type;
      const records = await this.#planService.getPlans(farmId, confirm);
      if (records.length === 0) {
        throw boom.notFound(StaticStrings.HTTP_STATUS_NOT_FOUND);
      }
      return this.#h.response(records);
    } catch (error) {
      console.error("Error in getCropsPlansByFarmId controller:", error);
      return this.#h.response({ error });
    }
  }

  async createCrop() {
    const { fieldId } = this.#request.params;
    const { Crop, ManagementPeriods } = this.#request.payload;
    const userId = this.#request.userId;
    try {
      const data = await this.#cropService.createCropWithManagementPeriods(
        fieldId,
        Crop,
        ManagementPeriods,
        userId
      );
      return this.#h.response(data);
    } catch (error) {
      console.error("Error in createCrop controller:", error);
      return this.#h.response({ error });
    }
  }

  async createNutrientsRecommendationForFieldByFieldId() {
    const body = this.#request.payload;
    const userId = this.#request.userId;
    this.#request;
    try {
      const data =
        await this.#planService.createNutrientsRecommendationForField(
          body.Crops,
          userId
        );
      return this.#h.response(data);
    } catch (error) {
      console.error("Error in createCropPlan:", error);
      return this.#h.response({ error });
    }
  }

  async getCropTypeByFieldAndYear() {
    const { fieldId } = this.#request.params;
    const { year, confirm } = this.#request.query;

    try {
      const cropTypeData =
        await this.#cropService.getCropTypeDataByFieldAndYear(
          fieldId,
          year,
          confirm
        );
      return this.#h.response(cropTypeData);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async updateCropByFieldAndYearAndConfirm() {
    try {
      const { fieldId } = this.#request.params; // Extract fieldId from params
      const { year, confirm } = this.#request.query; // Extract year and confirm from query
      const cropData = this.#request.payload; // Get the crop data from the payload
      const userId = this.#request.userId;

      const cropExists = await this.#cropService.getCrops(
        fieldId,
        year,
        confirm
      );
      if (
        cropExists &&
        cropExists.FieldID !== fieldId &&
        cropExists.Year !== year &&
        cropExists.Confirm !== confirm
      ) {
        throw boom.conflict("crop does'nt exist");
      }
      // Assuming you have a service method to update the crop data
      const updatedCrop =
        await this.#cropService.updateCropByFieldYearAndConfirm(
          cropData,
          userId,
          fieldId,
          year,
          confirm
        );

      if (!updatedCrop) {
        throw boom.notFound("Crop not found or update failed.");
      }

      return this.#h.response(updatedCrop); // Return the updated crop
    } catch (error) {
      console.error(
        "Error in updateCropByFieldAndYearAndConfirm controller:",
        error
      );
      return this.#h.response({ error }); // Return error response
    }
  }
  async getCropOrganicAndInorganicDetailsByHarvestYearAndFarmId() {
    try {
      const { harvestYear } = this.#request.params;
      const { farmId } = this.#request.query;

      // Call the CropService to fetch organic and inorganic details
      const cropDetails = await this.#cropService.getOrganicAndInorganicDetails(
        farmId,
        harvestYear,
        this.#request
      );

      if (!cropDetails || cropDetails.length === 0) {
        throw boom.notFound(StaticStrings.HTTP_STATUS_NOT_FOUND);
      }

      return this.#h.response(cropDetails);
    } catch (error) {
      console.error(
        "Error in getCropOrganicAndInorganicDetailsByHarvestYearAndFarmId controller:",
        error
      );
      return this.#h.response({ error });
    }
  }
  async getCropDataById() {
    try {
      const { id } = this.#request.params;
      const { records } = await this.#cropService.getById(id);

      return this.#h.response(records);
    } catch (error) {
      console.error("Error in getCropsDataByCropId controller:", error);
      return this.#h.response({ error });
    }
  }
  async deleteCropsByIds() {
    const { cropIds } = this.#request.payload;
 const userId = this.#request.userId;

    try {
     

      // Loop through each cropId and call the service method to delete it
      for (let cropId of cropIds) {
        const result = await this.#cropService.deleteCropById(
          cropId,
          userId,
          this.#request
        );

        if (result?.affectedRows === 0) {
          throw boom.notFound(`Crop with ID ${cropId} not found.`);
        }
      }

      return this.#h.response({ message: "Crops deleted successfully." });
    } catch (error) {
      return this.#h.response({ error: error.message });
    }
  }
}

module.exports = { CropController };
