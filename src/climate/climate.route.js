const Joi = require("joi");
const { ClimateController } = require("./climate.controller");
const { formatErrorResponse } = require("../interceptor/responseFormatter");

module.exports = [
  {
    method: "GET",
    path: "/climates/rainfall-average/{postcode}",
    handler: async (request, h) => {
      const controller = new ClimateController(request, h);
      return controller.getRainfallAverageByPostcode();
    },
    options: {
      tags: ["api", "Climates"],
      description: "Get rainfall average by post code",
      validate: {
        params: Joi.object({
          postcode: Joi.string()
            .required()
            .description("First half of Postcode, e.g., AB12"),
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
  {
    method: "GET",
    path: "/climates/total-rainfall",
    handler: async (request, h) => {
      const controller = new ClimateController(request, h);
      return controller.getTotalRainfallByPostcodeAndDate();
    },
    options: {
      tags: ["api", "Climates"],
      description: "Get total rainfall by postcode and date range",
      validate: {
        query: Joi.object({
          postCode: Joi.string()
            .required()
            .description("First half of Postcode, e.g., AB12"),
          startDate: Joi.string().required(),
          endDate: Joi.string().required(),
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
  {
    method: "GET",
    path: "/climates/all-data/{postcode}",
    handler: async (request, h) => {
      const controller = new ClimateController(request, h);
      return controller.getAllDataByPostcode();
    },
    options: {
      tags: ["api", "Climates"],
      description: "Get all climate data by postcode",
      validate: {
        params: Joi.object({
          postcode: Joi.string()
            .required()
            .description("First half of Postcode, e.g., AB12"),
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
