const Joi = require("joi");
const { ManureTypeController } = require("./manure-type.controller");
const { formatErrorResponse } = require("../interceptor/responseFormatter");

module.exports = [
  {
    method: "GET",
    path: "/manure-types/manure-groups/{manureGroupId}",
    options: {
      tags: ["api", "Manure Type"],
      description: "Get manure types by manureGroupId and countryId",
      validate: {
        params: Joi.object({
          manureGroupId: Joi.number().integer().required(),
        }),
        query: Joi.object({
          countryId: Joi.number().integer().required(),
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
      const controller = new ManureTypeController(request, h);
      return controller.getManureTypes();
    },
  },
  {
    method: "GET",
    path: "/manure-types/{manureTypeId}",
    options: {
      tags: ["api", "Manure Type"],
      description: "Get Manure Type by ManureTypeId",
      validate: {
        params: Joi.object({
          manureTypeId: Joi.number().integer().required(),
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
      const controller = new ManureTypeController(request, h);
      return controller.getManureTypeById();
    },
  },
];
