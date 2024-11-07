const Joi = require("joi");
const {
  RB209RecommendationController,
} = require("./recommendation.controller");
const {
  CalculateNutrientRecommendationsDto,
  CalculateNutrientOfftakeDto,
} = require("./dto/recommendation.dto");
const {
  formatErrorResponse,
} = require("../../../interceptor/responseFormatter");

module.exports = [
  {
    method: "POST",
    path: "/vendors/rb209/Recommendation/Recommendations",
    handler: async (request, h) => {
      const controller = new RB209RecommendationController(request, h);
      return controller.calculateNutrientRecommendations();
    },
    options: {
      tags: ["api", "RB209 Recommendation"],
      description: "The main connection to calculate Nutrient Recommendations",
      validate: {
        payload: CalculateNutrientRecommendationsDto,
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
    method: "POST",
    path: "/vendors/rb209/Recommendation/CalculateNutrientOfftake",
    handler: async (request, h) => {
      const controller = new RB209RecommendationController(request, h);
      return controller.calculateNutrientOfftake();
    },
    options: {
      tags: ["api", "RB209 Recommendation"],
      description: "The calculate crop nutrient offtake value",
      validate: {
        payload: CalculateNutrientOfftakeDto,
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
    path: "/vendors/rb209/Recommendation/CalculateNutrientDeficiency/{cropTypeId}/{leafSamplingPosition}/{nutrientId}/{nutrientContent}",
    handler: async (request, h) => {
      const controller = new RB209RecommendationController(request, h);
      return controller.calculateNutrientDeficiency();
    },
    options: {
      tags: ["api", "RB209 Recommendation"],
      description:
        "To get the nutrient deficiency result based on leaf analysis",
      validate: {
        params: Joi.object({
          cropTypeId: Joi.string().required(),
          leafSamplingPosition: Joi.string().required(),
          nutrientId: Joi.string().required(),
          nutrientContent: Joi.string().required(),
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
