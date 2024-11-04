const Joi = require("joi");
const { ManureGroupController } = require("./manure-group.controller");
const { formatErrorResponse } = require("../interceptor/responseFormatter");

module.exports = [
  {
    method: "GET",
    path: "/manure-groups",
    options: {
      tags: ["api", "Manure Group"],
      description: "Get list of Manure Groups",
    },
    handler: async (request, h) => {
      const controller = new ManureGroupController(request, h);
      return controller.getAllManureGroups();
    },
  },
  {
    method: "GET",
    path: "/manure-groups/{manureGroupId}",
    options: {
      tags: ["api", "Manure Group"],
      description: "Get Manure Group by ManureGroupId",
      validate: {
        params: Joi.object({
          manureGroupId: Joi.number().required(),
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
      const controller = new ManureGroupController(request, h);
      return controller.getManureGroupByManureGroupId();
    },
  },
];
