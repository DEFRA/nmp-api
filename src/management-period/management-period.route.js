const Joi = require("joi");
const {
  ManagementPeriodController,
} = require("./management-period.controller");
const { formatErrorResponse } = require("../interceptor/responseFormatter");
const { validationFailAction } = require("../shared/validateFailSafeAction");

module.exports = [
  {
    method: "GET",
    path: "/management-periods/crops/{cropId}",
    options: {
      tags: ["api", "ManagementPeriod"],
      description: "Get Management Period by Crop Id",
      validate: {
        params: Joi.object({
          cropId: Joi.number().integer().required(),
        }),
        query: Joi.object({
          shortSummary: Joi.boolean(),
        }),
        failAction: validationFailAction,
      },
    },
    handler: async (request, h) => {
      const controller = new ManagementPeriodController(request, h);
      return controller.getManagementPeriodByCropId();
    },
  },
  {
    method: "GET",
    path: "/management-periods/{managementPeriodId}",
    options: {
      tags: ["api", "ManagementPeriod"],
      description: "Get Management Period by Id",
      validate: {
        params: Joi.object({
          managementPeriodId: Joi.number().integer().required(),
        }),
        failAction: validationFailAction
      },
    },
    handler: async (request, h) => {
      const controller = new ManagementPeriodController(request, h);
      return controller.getById();
    },
  },
];
