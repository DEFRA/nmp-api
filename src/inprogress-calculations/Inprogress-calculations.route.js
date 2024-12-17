const Joi = require("joi");
const { formatErrorResponse } = require("../interceptor/responseFormatter");
const { InprogressCalculationsController } = require("./inprogress-calculations.controller");

module.exports = [
  {
    method: "GET",
    path: "/inprogress-calculations/{fieldId}",
    options: {
      tags: ["api", "Inprogress Calculations"],
      description: "Get Inprogress Calculations by FieldId and Harvest Year",
      validate: {
        params: Joi.object({
          fieldId: Joi.number().required(),
        }),
        query: Joi.object({
          year: Joi.number()
            .integer()
            .min(1900)
            .max(new Date().getFullYear())
            .required(), 
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
