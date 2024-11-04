const Joi = require("joi");
const { RB209RainfallController } = require("./rainfall.controller");
const {
  formatErrorResponse,
} = require("../../../interceptor/responseFormatter");

module.exports = [
  {
    method: "GET",
    path: "/vendors/rb209/RainFall/RainfallAverage/{postcode}",
    handler: async (request, h) => {
      const controller = new RB209RainfallController(request, h);
      return controller.getAverageRainfallByPostcode(request, h);
    },
    options: {
      tags: ["api", "RB209 Rainfall"],
      description: "Average Rainfall of field",
      validate: {
        params: Joi.object({
          postcode: Joi.string()
            .required()
            .description("First half of postcode, eg: AB12"),
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
  },
];
