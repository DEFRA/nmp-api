const Joi = require("joi");
const { ExcessRainFallOptionsController } = require("./excess-winter-rainfall-options.controller");

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
      const controller = new ExcessRainFallOptionsController(request, h);
      return controller.getValueByID();
    },
  },
];
