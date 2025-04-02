const Joi = require("joi");
const { formatErrorResponse } = require("../interceptor/responseFormatter");
const { GrassGrowthController } = require("./grass-growth-plan.controller");

const getController = (request, h) => new GrassGrowthController(request, h);

module.exports = [
  {
    method: "POST",
    path: "/grass-growth/byFieldIds/{harvestYear}",
    handler: async (request, h) => {
      return getController(request, h).getGrassGrowthClass();
    },
    options: {
      tags: ["api", "Grass Growth"],
      description: "Get Grass Growth By FieldIds and Harvest Year",
      validate: {
        params: Joi.object({
          harvestYear: Joi.number()
            .integer()
            .min(1900)
            .max(2100)
            .required()
            .description("Harvest year, e.g., 2024"),
        }),
        payload: Joi.object({
          fieldIds: Joi.array()
            .items(Joi.number().integer().required())
            .min(1)
            .required()
            .description("Array of field IDs, e.g., [0, 1, 2, 3]"),
        }),
        failAction: (request, h, err) => {
          return h
            .response(
              formatErrorResponse({
                source: { error: err },
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
