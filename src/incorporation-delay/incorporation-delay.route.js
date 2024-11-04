const Joi = require("joi");
const {
  IncorporationDelayController,
} = require("./incorporation-delay.controller");
const { formatErrorResponse } = require("../interceptor/responseFormatter");

module.exports = [
  {
    method: "GET",
    path: "/incorporation-delays/{id}",
    handler: async (request, h) => {
      const controller = new IncorporationDelayController(request, h);
      return controller.getIncorporationDelayById();
    },
    options: {
      tags: ["api", "Incorporation Delays"],
      description: "Get Incorporation Delay by ID",
      validate: {
        params: Joi.object({
          id: Joi.number()
            .integer()
            .required()
            .description("Incorporation Delay ID"),
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
    path: "/incorporation-delays/incorporation-methods/{methodId}",
    handler: async (request, h) => {
      const controller = new IncorporationDelayController(request, h);
      return controller.getIncorporationDelays();
    },
    options: {
      tags: ["api", "Incorporation Delays"],
      description:
        "Get list of Incorporation Delays by Incorporation Method Id",
      validate: {
        params: Joi.object({
          methodId: Joi.number()
            .integer()
            .required()
            .description("Incorporation Method ID"),
        }),
        query: Joi.object({
          applicableFor: Joi.string().required(),
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
