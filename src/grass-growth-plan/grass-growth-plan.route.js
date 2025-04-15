const Joi = require("joi");
const { formatErrorResponse } = require("../interceptor/responseFormatter");
const { GrassGrowthController } = require("./grass-growth-plan.controller");

const getController = (request, h) => new GrassGrowthController(request, h);

module.exports = [
  {
    method: "POST",
    path: "/grass-growth/byFieldIds",
    handler: async (request, h) => {
      return getController(request, h).getGrassGrowthClass();
    },
    options: {
      tags: ["api", "Grass Growth"],
      description: "Get Grass Growth By FieldIds and Harvest Year",
      validate: {
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
