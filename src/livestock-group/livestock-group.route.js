const Joi = require("joi");
const { LivestockGroupController } = require("./livestock-group.controller");
const { formatErrorResponse } = require("../interceptor/responseFormatter");

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
        failAction: (request, h, err) => {
          return h
            .response(
              formatErrorResponse({
                source: {
                  error: err,
                },
                request,
              })
            )
            .code(400)
            .takeover();
        },
      },
    },
    handler: async (request, h) => {
      const controller = new LivestockGroupController(request, h);
      return controller.getLivestockGroupBylivestockGroupId();
    },
  },
];
