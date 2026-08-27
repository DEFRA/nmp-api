const Joi = require("joi");
const { LivestockGroupController } = require("./livestock-group.controller");
const { formatErrorResponse } = require("../interceptor/responseFormatter");
const { validationFailAction } = require("../shared/validateFailSafeAction");

module.exports = [
  {
    method: "GET",
    path: "/livestock-groups",
    options: {
      tags: ["api", "Livestock Group"],
      description: "Get list of Livestock Groups",
    },
    handler: async (request, h) => {
      const controller = new LivestockGroupController(request, h);
      return controller.getAllLivestockGroups();
    },
  },
  {
    method: "GET",
    path: "/livestock-groups/{livestockGroupId}",
    options: {
      tags: ["api", "Livestock Group"],
      description: "Get Livestock Group by LivestockGroupId",
      validate: {
        params: Joi.object({
          livestockGroupId: Joi.number().required(),
        }),
        failAction: validationFailAction
      },
    },
    handler: async (request, h) => {
      const controller = new LivestockGroupController(request, h);
      return controller.getLivestockGroupBylivestockGroupId();
    },
  },
];
