const Joi = require("joi");
const { RecommendationController } = require("./recommendation.controller");
const { formatErrorResponse } = require("../interceptor/responseFormatter");
const BAD_REQUEST=400;
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
            .code(BAD_REQUEST)
            .takeover();
        },
      },
    },
  },
   {
      method: "GET",
      path: "/recommendations/{managementPeriodId}",
      options: {
         tags: ["api", "Recommendations"],
        description: "Get Recommendations by managementPeriodId",
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
              .code(BAD_REQUEST)
              .takeover();
          },
        },
      },
      handler: async (request, h) => {
        const controller = new RecommendationController(request, h);
        return controller.getByManagementPeriodId();
      },
    },    
];
