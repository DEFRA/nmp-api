const Joi = require("joi");
const { RecommendationController } = require("./recommendation.controller");
const { formatErrorResponse } = require("../interceptor/responseFormatter");

module.exports = [
  {
    method: "GET",
    path: "/recommendations",
    handler: async (request, h) => {
      const controller = new RecommendationController(request, h);
      return controller.getNutrientsRecommendationsForFieldByFieldIdAndHarvestYear();
    },
    options: {
      tags: ["api", "Recommendations"],
      description: "Get Recommendations for field by Field Id and Harvest Year",
      validate: {
        query: Joi.object({
          fieldId: Joi.number().integer().required(),
          harvestYear: Joi.number().integer().required(),
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
