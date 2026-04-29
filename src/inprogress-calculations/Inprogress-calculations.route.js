const Joi = require("joi");
const { formatErrorResponse } = require("../interceptor/responseFormatter");
const { InprogressCalculationsController } = require("./inprogress-calculations.controller");
const { validationFailAction } = require("../shared/validateFailSafeAction");
const minimumYear = 1900;
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
            .min(minimumYear)
            .max(new Date().getFullYear())
            .required(), 
        }),
        failAction: validationFailAction
      },
    },
    handler: async (request, h) => {
      const controller = new InprogressCalculationsController(request, h);
      return controller.getInprogressCalculationsByFarmID();
    },
  },
];
