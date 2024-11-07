const Joi = require("joi");
const {
  InorganicManureDurationController,
} = require("./inorganic-manure-duration.controller");
const { formatErrorResponse } = require("../interceptor/responseFormatter");

const getController = (request, h) =>
  new InorganicManureDurationController(request, h);

module.exports = [
  {
    method: "GET",
    path: "/inorganic-manure-durations",
    options: {
      tags: ["api", "Inorganic Manure Durations"],
      description: "Get list of Inorganic Manure Durations",
      handler: async (request, h) => {
        return getController(request, h).getInorganicManureDurations();
      },
    },
  },
  {
    method: "GET",
    path: "/inorganic-manure-durations/{id}",
    options: {
      tags: ["api", "Inorganic Manure Durations"],
      description: "Get Inorganic Manure Duration by ID",
      validate: {
        params: Joi.object({
          id: Joi.number()
            .integer()
            .required()
            .description("Inorganic Manure Duration ID"),
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
      handler: async (request, h) => {
        return getController(request, h).getInorganicManureDurationById();
      },
    },
  },
];
