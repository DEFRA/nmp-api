const Joi = require("joi");
const {
  ManagementPeriodController,
} = require("./management-period.controller");
const { formatErrorResponse } = require("../interceptor/responseFormatter");

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
      const controller = new ManagementPeriodController(request, h);
      return controller.getById();
    },
  },
];
