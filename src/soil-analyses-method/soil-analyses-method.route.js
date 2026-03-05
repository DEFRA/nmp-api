const Joi = require("joi");
const { formatErrorResponse } = require("../interceptor/responseFormatter");
const { SoilAnalysesMethodController } = require("./soil-analyses-method.controller");

module.exports = [
  {
    method: "GET",
    path: "/soil-analyses-method",
    options: {
      tags: ["api", "Soil Analyses Method"],
      description: "Get all Soil Analyses Method",
    },
    handler: async (request, h) => {
      const controller = new SoilAnalysesMethodController(request, h);
      return controller.getAll();
    },
  },
  {
    method: "GET",
    path: "/soil-analyses-method/{id}",
    options: {
      tags: ["api", "Soil Analyses Method"],
      description: "Get Soil Analyses Method by ID",
      validate: {
        params: Joi.object({
          id: Joi.number().integer().required(),
        }),
        failAction: (request, h, err) => {
          return h
            .response(
              formatErrorResponse({
                source: { error: err },
                request,
              }),
            )
            .code(400)
            .takeover();
        },
      },
    },
    handler: async (request, h) => {
      const controller = new SoilAnalysesMethodController(request, h);
      return controller.getById();
    },
  },
];
