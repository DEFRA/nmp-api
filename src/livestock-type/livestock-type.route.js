const Joi = require("joi");
const { LivestockTypeController } = require("./livestock-type.controller");
const { formatErrorResponse } = require("../interceptor/responseFormatter");
const { validationFailAction } = require("../shared/validateFailSafeAction");

module.exports = [
  {
    method: "GET",
    path: "/livestock-types",
    options: {
      tags: ["api", "Livestock Type"],
      description: "Get list of Livestock Types",
    },
    handler: async (request, h) => {
      const controller = new LivestockTypeController(request, h);
      return controller.getAllLivestockTypes();
    }
  },

  {
    method: "GET",
    path: "/livestock-types/{livestockGroupId}",
    options: {
      tags: ["api", "Livestock Type"],
      description: "Get Livestock Type by LivestockGroupId",
      validate: {
        params: Joi.object({
          livestockGroupId: Joi.number().required(),
        }),
        failAction: validationFailAction
      },
    },
    handler: async (request, h) => {
      const controller = new LivestockTypeController(request, h);
      return controller.getLivestockTypesBylivestockGroupId();
    }
  },
];
