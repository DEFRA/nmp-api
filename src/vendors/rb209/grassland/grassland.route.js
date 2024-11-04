const Joi = require("joi");
const { RB209GrasslandController } = require("./grassland.controller");
const {
  formatErrorResponse,
} = require("../../../interceptor/responseFormatter");

module.exports = [
  // Grassland Seasons by Country ID
  {
    method: "GET",
    path: "/vendors/rb209/Grassland/GrasslandSeasons/{countryId}",
    handler: async (request, h) => {
      const controller = new RB209GrasslandController(request, h);
      return controller.getGrasslandSeasonsByCountryId(request, h);
    },
    options: {
      tags: ["api", "RB209 Grassland"],
      description: "List of grassland seasons by country ID",
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

  // Grassland Season by Season ID
  {
    method: "GET",
    path: "/vendors/rb209/Grassland/GrasslandSeason/{seasonId}",
    handler: async (request, h) => {
      const controller = new RB209GrasslandController(request, h);
      return controller.getGrasslandSeasonBySeasonId(request, h);
    },
    options: {
      tags: ["api", "RB209 Grassland"],
      description: "Individual grassland season filtered by season ID",
      validate: {
        params: Joi.object({
          seasonId: Joi.string().required(),
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

  // Grassland Field Types by Country ID
  {
    method: "GET",
    path: "/vendors/rb209/Grassland/GrasslandFieldTypes/{countryId}",
    handler: async (request, h) => {
      const controller = new RB209GrasslandController(request, h);
      return controller.getGrasslandFieldTypesByCountryId(request, h);
    },
    options: {
      tags: ["api", "RB209 Grassland"],
      description: "List of grassland field types by country ID",
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

  // Grassland Field Type by Field Type ID
  {
    method: "GET",
    path: "/vendors/rb209/Grassland/GrasslandFieldType/{fieldTypeId}",
    handler: async (request, h) => {
      const controller = new RB209GrasslandController(request, h);
      return controller.getGrasslandFieldTypeByFieldTypeId(request, h);
    },
    options: {
      tags: ["api", "RB209 Grassland"],
      description: "Individual grassland field type filtered by field type ID",
      validate: {
        params: Joi.object({
          fieldTypeId: Joi.string().required(),
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

  // Grass Growth Classes by Country ID
  {
    method: "GET",
    path: "/vendors/rb209/Grassland/GrassGrowthClasses/{countryId}",
    handler: async (request, h) => {
      const controller = new RB209GrasslandController(request, h);
      return controller.getGrassGrowthClassesByCountryId(request, h);
    },
    options: {
      tags: ["api", "RB209 Grassland"],
      description: "List of grass growth classes by country ID",
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

  // Grass Growth Class by Grass Growth Class ID
  {
    method: "GET",
    path: "/vendors/rb209/Grassland/GrassGrowthClass/{grassGrowthClassId}",
    handler: async (request, h) => {
      const controller = new RB209GrasslandController(request, h);
      return controller.getGrassGrowthClassByGrassGrowthClassId(request, h);
    },
    options: {
      tags: ["api", "RB209 Grassland"],
      description:
        "Individual grass growth class filtered by grass growth class ID",
      validate: {
        params: Joi.object({
          grassGrowthClassId: Joi.string().required(),
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

  // Grass Growth Class by Soil Type, Rainfall, Altitude, and Chalk
  {
    method: "GET",
    path: "/vendors/rb209/Grassland/GrassGrowthClass/{soilTypeId}/{rainfall}/{altitude}/{chalk}",
    handler: async (request, h) => {
      const controller = new RB209GrasslandController(request, h);
      return controller.getGrassGrowthClassBySoilTypeIdAndRainfallAndAltitudeAndChalk(
        request,
        h
      );
    },
    options: {
      tags: ["api", "RB209 Grassland"],
      description:
        "Grass growth class filtered by soil type, rainfall, altitude, and chalk",
      validate: {
        params: Joi.object({
          soilTypeId: Joi.string().required(),
          rainfall: Joi.number().required(),
          altitude: Joi.number().required(),
          chalk: Joi.boolean().required(),
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

  // Crop Materials by Country ID
  {
    method: "GET",
    path: "/vendors/rb209/Grassland/CropMaterials/{countryId}",
    handler: async (request, h) => {
      const controller = new RB209GrasslandController(request, h);
      return controller.getCropMaterialsByCountryId(request, h);
    },
    options: {
      tags: ["api", "RB209 Grassland"],
      description: "Full list of available Crop Materials for Grassland fields",
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

  // Crop Material by Crop Material ID
  {
    method: "GET",
    path: "/vendors/rb209/Grassland/CropMaterial/{cropMaterialId}",
    handler: async (request, h) => {
      const controller = new RB209GrasslandController(request, h);
      return controller.getCropMaterialByCropMaterialId(request, h);
    },
    options: {
      tags: ["api", "RB209 Grassland"],
      description:
        "Individual Crop Material Text filtered from the supplied corresponding Crop Material ID",
      validate: {
        params: Joi.object({
          cropMaterialId: Joi.string().required(),
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

  // Yield Type by Yield Type ID
  {
    method: "GET",
    path: "/vendors/rb209/Grassland/YieldType/{yieldTypeId}",
    handler: async (request, h) => {
      const controller = new RB209GrasslandController(request, h);
      return controller.getYieldTypeByYieldTypeId(request, h);
    },
    options: {
      tags: ["api", "RB209 Grassland"],
      description: "Individual yield type filtered by yield type ID",
      validate: {
        params: Joi.object({
          yieldTypeId: Joi.string().required(),
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

  // Yield Types by Country ID
  {
    method: "GET",
    path: "/vendors/rb209/Grassland/YieldTypes/{countryId}",
    handler: async (request, h) => {
      const controller = new RB209GrasslandController(request, h);
      return controller.getYieldTypesByCountryId(request, h);
    },
    options: {
      tags: ["api", "RB209 Grassland"],
      description: "List of yield types by country ID",
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

  // Soil Nitrogen Supplies by Country ID
  {
    method: "GET",
    path: "/vendors/rb209/Grassland/SoilNitrogenSupplies/{countryId}",
    handler: async (request, h) => {
      const controller = new RB209GrasslandController(request, h);
      return controller.getSoilNitrogenSuppliesByCountryId(request, h);
    },
    options: {
      tags: ["api", "RB209 Grassland"],
      description: "List of soil nitrogen supplies by country ID",
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

  // Soil Nitrogen Supply Item by Soil Nitrogen Supply ID
  {
    method: "GET",
    path: "/vendors/rb209/Grassland/SoilNitrogenSupplyItem/{soilNitrogenSupplyId}",
    handler: async (request, h) => {
      const controller = new RB209GrasslandController(request, h);
      return controller.getSoilNitrogenSupplyItemBySoilNitrogenSupplyId(
        request,
        h
      );
    },
    options: {
      tags: ["api", "RB209 Grassland"],
      description:
        "Individual Soil Nitrogen Supply (SNS) Text filtered from the supplied corresponding Soil Nitrogen Supply ID",
      validate: {
        params: Joi.object({
          soilNitrogenSupplyId: Joi.string().required(),
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

  // Grass Histories by Country ID
  {
    method: "GET",
    path: "/vendors/rb209/Grassland/GrassHistories/{countryId}",
    handler: async (request, h) => {
      const controller = new RB209GrasslandController(request, h);
      return controller.getGrassHistoriesByCountryId(request, h);
    },
    options: {
      tags: ["api", "RB209 Grassland"],
      description: "List of grass histories by country ID",
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

  // Grass History by Grass History ID
  {
    method: "GET",
    path: "/vendors/rb209/Grassland/GrassHistory/{grassHistoryId}",
    handler: async (request, h) => {
      const controller = new RB209GrasslandController(request, h);
      return controller.getGrassHistoryByGrassHistoryId(request, h);
    },
    options: {
      tags: ["api", "RB209 Grassland"],
      description: "Individual grass history filtered by grass history ID",
      validate: {
        params: Joi.object({
          grassHistoryId: Joi.string().required(),
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
    path: "/vendors/rb209/Grassland/GrasslandFieldTypeItem/{fieldTypeId}",
    handler: async (request, h) => {
      const controller = new RB209GrasslandController(request, h);
      return controller.getGrasslandFieldTypeItemByFieldTypeId(request, h);
    },
    options: {
      tags: ["api", "RB209 Grassland"],
      description: "Grassland Field Type of Grassland Field Type ID provided",
      validate: {
        params: Joi.object({
          fieldTypeId: Joi.string().required(),
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
    path: "/vendors/rb209/Grassland/GrassSequenceItem/{grassSequenceId}",
    handler: async (request, h) => {
      const controller = new RB209GrasslandController(request, h);
      return controller.getGrassSequenceItemByGrassSequenceId(request, h);
    },
    options: {
      tags: ["api", "RB209 Grassland"],
      description:
        "Individual Grass Sequence Text filtered from the supplied corresponding Grass Sequence ID",
      validate: {
        params: Joi.object({
          grassSequenceId: Joi.string().required(),
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
    path: "/vendors/rb209/Grassland/GrassSequences/{seasonId}/{fieldTypeId}/{countryId}",
    handler: async (request, h) => {
      const controller = new RB209GrasslandController(request, h);
      return controller.getGrassSequencesBySeasonIdAndFieldTypeIdAndCountryId(
        request,
        h
      );
    },
    options: {
      tags: ["api", "RB209 Grassland"],
      description:
        "Full list of available Grass Sequences for Grassland fields",
      validate: {
        params: Joi.object({
          seasonId: Joi.string().required(),
          fieldTypeId: Joi.string().required(),
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
    path: "/vendors/rb209/Grassland/SequenceItem/{sequenceItemId}",
    handler: async (request, h) => {
      const controller = new RB209GrasslandController(request, h);
      return controller.getSequenceItemBySequenceItemId(request, h);
    },
    options: {
      tags: ["api", "RB209 Grassland"],
      description:
        "Individual Sequence Item Text filtered from the supplied corresponding Sequence Item ID",
      validate: {
        params: Joi.object({
          sequenceItemId: Joi.string().required(),
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
    path: "/vendors/rb209/Grassland/SequenceItems/{countryId}",
    handler: async (request, h) => {
      const controller = new RB209GrasslandController(request, h);
      return controller.getSequenceItemsByCountryId(request, h);
    },
    options: {
      tags: ["api", "RB209 Grassland"],
      description: "Full list of available Sequence Items for Grassland fields",
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
    path: "/vendors/rb209/Grassland/SoilNitrogenSupply/{grassHistoryId}",
    handler: async (request, h) => {
      const controller = new RB209GrasslandController(request, h);
      return controller.getSoilNitrogenSupplyByGrassHistoryId(request, h);
    },
    options: {
      tags: ["api", "RB209 Grassland"],
      description:
        "Calculate the Soil Nitrogen Supply (SNS) Status for a Grassland Field",
      validate: {
        params: Joi.object({
          grassHistoryId: Joi.string().required(),
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
