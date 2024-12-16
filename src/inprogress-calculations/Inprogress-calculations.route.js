const Joi = require("joi");
const { formatErrorResponse } = require("../interceptor/responseFormatter");
const { InprogressCalculationsController } = require("./inprogress-calculations.controller");

module.exports = [
  {
    method: "GET",
    path: "/inprogress-calculations/{farmId}",
    options: {
      tags: ["api", "Inprogress Calculations"],
      description: "Get Inprogress Calculations by FarmID",
      validate: {
        params: Joi.object({
          farmId: Joi.number().required(),
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
      const controller = new InprogressCalculationsController(request, h);
      return controller.getInprogressCalculationsByFarmID();
    },
  },
];