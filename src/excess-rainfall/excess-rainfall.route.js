const Joi = require("joi");
const { formatErrorResponse } = require("../interceptor/responseFormatter");
const { ExcessRainfallController } = require("./excess-rainfall.controller");


module.exports = [
  {
    method: "GET",
    path: "/excessRainfalls/{farmId}",
    options: {
      tags: ["api", "ExcessRainfalls"],
      description: "Get ExcessRainfalls by FarmID and Year",
      validate: {
        params: Joi.object({
          farmId: Joi.number().integer().required(),
        }),
        query: Joi.object({
          year: Joi.number().integer().required(), // Expecting year as a query parameter
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
      const controller = new ExcessRainfallController(request, h);
      return controller.getExcessRainfallByFarmIdAndYear();
    },
  },
];
