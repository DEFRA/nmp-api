const Joi = require("joi");
const { MannerCropTypeController } = require("./manner-crop-type.controller");
const { formatErrorResponse } = require("../interceptor/responseFormatter");
const { validationFailAction } = require("../shared/validateFailSafeAction");

module.exports = [
  {
    method: "GET",
    path: "/manner-crop-types/{cropTypeID}",
    handler: async (request, h) => {
      const controller = new MannerCropTypeController(request, h);
      return controller.getMannerCropTypesByCropTypeID();
    },
    options: {
      tags: ["api", "Manner Crop Types"],
      description: "Get MannerCropTypeId and cropUptakeFactor by CropTypeId",
      validate: {
        params: Joi.object({
          cropTypeID: Joi.number().integer().required(),
        }),
        failAction: validationFailAction
      },
    },
  },
];
