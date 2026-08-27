const Joi = require("joi");
const { ExcessRainFallOptionsController } = require("./excess-winter-rainfall-options.controller");
const { formatErrorResponse } = require("../interceptor/responseFormatter");
const { validationFailAction } = require("../shared/validateFailSafeAction");

module.exports = [
  {
    method: "GET",
    path: "/excess-winter-rainfall-options",
    options: {
      tags: ["api", "ExcessWinterRainfallOptions"],
      description: "Get all ExcessWinterRainfallOptions data",
    },
    handler: async (request, h) => {
      const controller = new ExcessRainFallOptionsController(request, h);
      return controller.findAll();
    },
  },
  {
    method: "GET",
    path: "/excess-winter-rainfall-options/value/{Id}",
    options: {
      tags: ["api", "ExcessWinterRainfallOptions"],
      description: "Get ExcessWinterRainfallOptions Value by Id",
      validate: {
        params: Joi.object({
          Id: Joi.number().integer().required(),
        }),
        failAction: validationFailAction
      },
    },
    handler: async (request, h) => {
      const controller = new ExcessRainFallOptionsController(request, h);
      return controller.getValueByID();
    },
  },
];
