const Joi = require("joi");
const { ManureGroupController } = require("./manure-group.controller");
const { formatErrorResponse } = require("../interceptor/responseFormatter");
const { validationFailAction } = require("../shared/validateFailSafeAction");

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
        failAction: validationFailAction
      },
    },
    handler: async (request, h) => {
      const controller = new ManureGroupController(request, h);
      return controller.getManureGroupByManureGroupId();
    },
  },
];
