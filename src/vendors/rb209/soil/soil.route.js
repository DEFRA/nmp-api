const Joi = require("joi");
const { RB209SoilController } = require("./soil.controller");
const {
  formatErrorResponse,
} = require("../../../interceptor/responseFormatter");

module.exports = [
  {
    method: "GET",
    path: "/vendors/rb209/Soil/SoilTypes",
    handler: async (request, h) => {
      const controller = new RB209SoilController(request, h);
      return controller.getSoilTypes(request, h);
    },
    options: {
      tags: ["api", "RB209 Soil"],
      description: "The full list of available Soil Types",
    },
  },
  {
    method: "GET",
    path: "/vendors/rb209/Soil/SoilType/{soilTypeId}",
    handler: async (request, h) => {
      const controller = new RB209SoilController(request, h);
      return controller.getSoilTypeBySoilTypeId(request, h);
    },
    options: {
      tags: ["api", "RB209 Soil"],
      description: "Individual Soil Type - filtered by Soil Type Id",
      validate: {
        params: Joi.object({
          soilTypeId: Joi.string().required(),
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
    path: "/vendors/rb209/Soil/Methodologies/{nutrientId}/{countryId}",
    handler: async (request, h) => {
      const controller = new RB209SoilController(request, h);
      return controller.getMethodologiesByNutrientIdAndCountryId(request, h);
    },
    options: {
      tags: ["api", "RB209 Soil"],
      description:
        "A filtered list of available Soil Methodologies - filtered by Nutrient Id and Country Id",
      validate: {
        params: Joi.object({
          nutrientId: Joi.string().required(),
          countryId: Joi.string().required(),
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
    path: "/vendors/rb209/Soil/Methodology/{nutrientId}/{methodologyId}",
    handler: async (request, h) => {
      const controller = new RB209SoilController(request, h);
      return controller.getMethodologyByNutrientIdAndMethodologyId(request, h);
    },
    options: {
      tags: ["api", "RB209 Soil"],
      description:
        "Individual Soil Methodology - filtered by Nutrient Id and Methodology Id",
      validate: {
        params: Joi.object({
          nutrientId: Joi.string().required(),
          methodologyId: Joi.string().required(),
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
    path: "/vendors/rb209/Soil/NutrientIndex/{nutrientId}/{indexId}",
    handler: async (request, h) => {
      const controller = new RB209SoilController(request, h);
      return controller.getNutrientIndexByNutrientIdAndIndexId(request, h);
    },
    options: {
      tags: ["api", "RB209 Soil"],
      description:
        "Individual Nutrient Index Item - filtered by Nutrient Id and Index Id",
      validate: {
        params: Joi.object({
          nutrientId: Joi.string().required(),
          indexId: Joi.string().required(),
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
    path: "/vendors/rb209/Soil/NutrientIndex/{nutrientId}/{nutrientValue}/{methodologyId}",
    handler: async (request, h) => {
      const controller = new RB209SoilController(request, h);
      return controller.getNutrientIndexByNutrientIdAndNutrientValueAndMethodologyId(
        request,
        h
      );
    },
    options: {
      tags: ["api", "RB209 Soil"],
      description:
        "Individual Nutrient Index Item - filtered by Nutrient Id, Nutrient Value and Methodology Id",
      validate: {
        params: Joi.object({
          nutrientId: Joi.string().required(),
          nutrientValue: Joi.string().required(),
          methodologyId: Joi.string().required(),
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
    path: "/vendors/rb209/Soil/NutrientIndexIdFromValue/{nutrientId}/{methodologyId}/{nutrientValue}/{countryId}",
    handler: async (request, h) => {
      const controller = new RB209SoilController(request, h);
      return controller.getNutrientIndexIdFromValueByNutrientIdAndMethodologyIdAndNutrientValue(
        request,
        h
      );
    },
    options: {
      tags: ["api", "RB209 Soil"],
      description:
        "Individual Nutrient Index Id - filtered by Nutrient Id, Methodology Id and Nutrient Value",
      validate: {
        params: Joi.object({
          nutrientId: Joi.string().required(),
          nutrientValue: Joi.string().required(),
          methodologyId: Joi.string().required(),
          countryId: Joi.string().required(),
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
    path: "/vendors/rb209/Soil/NutrientIndices/{nutrientId}/{methodologyId}/{countryId}",
    handler: async (request, h) => {
      const controller = new RB209SoilController(request, h);
      return controller.getNutrientIndicesByNutrientIdAndMethodologyIdAndCountryId(
        request,
        h
      );
    },
    options: {
      tags: ["api", "RB209 Soil"],
      description:
        "A filtered list of available Nutrient Indexes - filtered by Nutrient Id, Methodology Id and Country Id",
      validate: {
        params: Joi.object({
          nutrientId: Joi.string().required(),
          methodologyId: Joi.string().required(),
          countryId: Joi.string().required(),
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
    path: "/vendors/rb209/Soil/NutrientTargetIndex/{cropGroupId}/{nutrientId}/{countryId}",
    handler: async (request, h) => {
      const controller = new RB209SoilController(request, h);
      return controller.getNutrientTargetIndexByCropGroupIdAndNutrientIdAndCountryId(
        request,
        h
      );
    },
    options: {
      tags: ["api", "RB209 Soil"],
      description: "Get the nutrient target index",
      validate: {
        params: Joi.object({
          cropGroupId: Joi.string().required(),
          nutrientId: Joi.string().required(),
          countryId: Joi.string().required(),
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
    path: "/vendors/rb209/Soil/NvzActionProgram/{countryId}",
    handler: async (request, h) => {
      const controller = new RB209SoilController(request, h);
      return controller.getNvzActionProgramByCountryId(request, h);
    },
    options: {
      tags: ["api", "RB209 Soil"],
      description: "The full list of NVZ Action program",
      validate: {
        params: Joi.object({
          countryId: Joi.string().required(),
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
    path: "/vendors/rb209/Soil/SoilPhRecommendation/{soilTypeId}/{countryId}",
    handler: async (request, h) => {
      const controller = new RB209SoilController(request, h);
      return controller.getSoilPhRecommendationBySoilTypeIdAndCountryId(
        request,
        h
      );
    },
    options: {
      tags: ["api", "RB209 Soil"],
      description: "Get list of soil ph Recommendation level",
      validate: {
        params: Joi.object({
          soilTypeId: Joi.string().required(),
          countryId: Joi.string().required(),
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
    path: "/vendors/rb209/Soil/SoilPsc/{cropGroupId}/{pIndexId}",
    handler: async (request, h) => {
      const controller = new RB209SoilController(request, h);
      return controller.getSoilPscByCropGroupIdAndPIndexId(request, h);
    },
    options: {
      tags: ["api", "RB209 Soil"],
      description: "Get the list of all available PSC for selected crop group",
      validate: {
        params: Joi.object({
          cropGroupId: Joi.string().required(),
          pIndexId: Joi.string().required(),
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
