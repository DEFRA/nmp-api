const Joi = require("joi");
const {
  formatErrorResponse,
} = require("../../../interceptor/responseFormatter");
const { RB209GrassController } = require("./grass.controller");

module.exports = [
  // {
  //   method: "GET",
  //   path: "/vendors/rb209/Grass/DefoliationSequence",
  //   handler: async (request, h) => {
  //     const controller = new RB209GrassController(request, h);
  //     return controller.getGrassDefoliationSequence(request, h);
  //   },
  //   options: {
  //     tags: ["api", "RB209 Grass"],
  //     description:
  //       "The list of different defoliation sequences available for grass fields.",
  //     validate: {
  //       query: Joi.object({
  //         swardTypeId: Joi.number()
  //           .integer()
  //           .description("The Sward Type Id of the field."),
  //         numberOfCuts: Joi.number()
  //           .integer()
  //           .description("The number of cuts made to the field in the season."),
  //       }),
  //       failAction: (request, h, err) => {
  //         return h
  //           .response(
  //             formatErrorResponse({
  //               source: {
  //                 error: err,
  //               },
  //               request,
  //             })
  //           )
  //           .code(400)
  //           .takeover();
  //       },
  //     },
  //   },
  // },
  {
    method: "GET",
    path: "/vendors/rb209/Grass/DefoliationSequence/{defoliationSequenceId}",
    handler: async (request, h) => {
      const controller = new RB209GrassController(request, h);
      return controller.getGrassDefoliationSequenceByDefoliationSequenceId(
        request,
        h
      );
    },
    options: {
      tags: ["api", "RB209 Grass"],
      description:
        "Get the text of the defoliation sequence for the provided defoliation sequence id.",
      validate: {
        params: Joi.object({
          defoliationSequenceId: Joi.number()
            .integer()
            .required()
            .description("The Defoliation Sequence Id of the field."),
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
    path: "/vendors/rb209/Grass/DefoliationSequences/{swardTypeId}/{numberOfCuts}/{newSward}",
    handler: async (request, h) => {
      const controller = new RB209GrassController(request, h);
      return controller.getGrassDefoliationSequence(request, h);
    },
    options: {
      tags: ["api", "RB209 Grass"],
      description:
        "The list of different defoliation sequences available for grass fields.",
      validate: {
        params: Joi.object({
          swardTypeId: Joi.number()
            .integer()
            .required()
            .description("The Sward Type Id of the field."),
          numberOfCuts: Joi.number()
            .integer()
            .required()
            .description("The number of cuts made to the field in the season."),
          newSward: Joi.boolean()
            .required()
            .description("Whether a new sward (true) or not (false)"),
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
    path: "/vendors/rb209/Grass/GrassGrowthClasses/{countryId}",
    handler: async (request, h) => {
      const controller = new RB209GrassController(request, h);
      return controller.getGrassGrowthClassesByCountryId(request, h);
    },
    options: {
      tags: ["api", "RB209 Grass"],
      description:
        "Full list of available Grass Growth Classes (GGC) for Grassland fields",
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
    path: "/vendors/rb209/Grass/GrassHistories/{countryId}",
    handler: async (request, h) => {
      const controller = new RB209GrassController(request, h);
      return controller.getGrassHistoriesByCountryId(request, h);
    },
    options: {
      tags: ["api", "RB209 Grass"],
      description: "Grass History list of Grass Fields",
      validate: {
        params: Joi.object({
          countryId: Joi.string()
            .required()
            .description("The Country ID to filter on"),
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
    path: "/vendors/rb209/Grass/GrassHistory/{grassHistoryId}",
    handler: async (request, h) => {
      const controller = new RB209GrassController(request, h);
      return controller.getGrassHistoryByGrassHistoryId(request, h);
    },
    options: {
      tags: ["api", "RB209 Grass"],
      description: "Grass History of Grass History ID provided",
      validate: {
        params: Joi.object({
          grassHistoryId: Joi.string()
            .required()
            .description("The Grass History ID"),
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
    path: "/vendors/rb209/Grass/GrassSeasons/{seasonId}",
    handler: async (request, h) => {
      const controller = new RB209GrassController(request, h);
      return controller.getGrassSeasonBySeasonId(request, h);
    },
    options: {
      tags: ["api", "RB209 Grass"],
      description: "This endpoint is used to return grass season",
      validate: {
        params: Joi.object({
          seasonId: Joi.string().required().description("The Season ID"),
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
    path: "/vendors/rb209/Grass/GrassSeason/{countryId}",
    handler: async (request, h) => {
      const controller = new RB209GrassController(request, h);
      return controller.getGrassSeasonByCountryId(request, h);
    },
    options: {
      tags: ["api", "RB209 Grass"],
      description: "This endpoint is used to return grass seasons",
      validate: {
        params: Joi.object({
          countryId: Joi.string().required().description("The Country ID"),
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
    path: "/vendors/rb209/Grass/GrassGrowthClass/{grassGrowthClassId}",
    handler: async (request, h) => {
      const controller = new RB209GrassController(request, h);
      return controller.getGrassGrowthClassByGrassGrowthClassId(request, h);
    },
    options: {
      tags: ["api", "RB209 Grass"],
      description:
        "Individual Grass Growth Class (GGC) Text filtered from the supplied corresponding Grass Growth Class ID",
      validate: {
        params: Joi.object({
          grassGrowthClassId: Joi.string()
            .required()
            .description("The Grass Growth Class ID to filter on"),
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
    path: "/vendors/rb209/Grass/GrassGrowthClass/{soilTypeId}/{rainfall}/{altitude}/{chalk}",
    handler: async (request, h) => {
      const controller = new RB209GrassController(request, h);
      return controller.getGrassGrowthClassBySoilTypeIdAndRainfallAndAltitudeAndChalk(
        request,
        h
      );
    },
    options: {
      tags: ["api", "RB209 Grass"],
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
  // {
  //     method: "GET",
  //     path: "/vendors/rb209/Grass/PotentialCuts",
  //     handler: async (request, h) => {
  //       const controller = new RB209GrassController(request, h);
  //       return controller.getGrassCutsForField(request, h);
  //     },
  //     options: {
  //       tags: ["api", "RB209 Grass"],
  //       description: "The list of different number of cuts for the field.",
  //       validate: {
  //         query: Joi.object({
  //           swardTypeId: Joi.number()
  //             .integer()
  //             .description("The Sward Type Id of the field."),
  //           swardManagementId: Joi.number()
  //             .integer()
  //             .description("The Sward Management Id of the field."),
  //         }),
  //         failAction: (request, h, err) => {
  //           return h
  //             .response(
  //               formatErrorResponse({
  //                 source: {
  //                   error: err,
  //                 },
  //                 request,
  //               })
  //             )
  //             .code(400)
  //             .takeover();
  //         },
  //       },
  //     },
  //   },
  {
    method: "GET",
    path: "/vendors/rb209/Grass/PotentialCuts/{swardTypeId}/{swardManagementId}",
    handler: async (request, h) => {
      const controller = new RB209GrassController(request, h);
      return controller.getGrassCutsForField(request, h);
    },
    options: {
      tags: ["api", "RB209 Grass"],
      description: "The list of different number of cuts for the field.",
      validate: {
        params: Joi.object({
          swardTypeId: Joi.number()
            .integer()
            .required()
            .description("The Sward Type Id of the field."),
          swardManagementId: Joi.number()
            .integer()
            .required()
            .description("The Sward Management Id of the field."),
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
    path: "/vendors/rb209/Grass/SwardManagement/{swardManagementId}",
    handler: async (request, h) => {
      const controller = new RB209GrassController(request, h);
      return controller.getSwardManagementBySwardManagementId(request, h);
    },
    options: {
      tags: ["api", "RB209 Grass"],
      description:
        "Get the text of the sward management for the provided sward management id.",
      validate: {
        params: Joi.object({
          swardManagementId: Joi.number()
            .integer()
            .required()
            .description("The Sward Management Id of the field."),
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
    path: "/vendors/rb209/Grass/SwardManagements",
    handler: async (request, h) => {
      const controller = new RB209GrassController(request, h);
      return controller.getSwardManagementsForGrassFields(request, h);
    },
    options: {
      tags: ["api", "RB209 Grass"],
      description:
        "The list of different sward managements available for grass fields.",
      validate: {
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
    path: "/vendors/rb209/Grass/SwardManagements/{swardTypeId}",
    handler: async (request, h) => {
      const controller = new RB209GrassController(request, h);
      return controller.getSwardManagementBySwardTypeId(request, h);
    },
    options: {
      tags: ["api", "RB209 Grass"],
      description:
        "The list of different sward managements available for the provided sward type.",
      validate: {
        params: Joi.object({
          swardTypeId: Joi.number()
            .integer()
            .required()
            .description("The Sward Type Id of the field."),
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
    path: "/vendors/rb209/Grass/SwardType/{swardTypeId}",
    handler: async (request, h) => {
      const controller = new RB209GrassController(request, h);
      return controller.getSwardTypeBySwardTypeId(request, h);
    },
    options: {
      tags: ["api", "RB209 Grass"],
      description:
        "Get the text of the sward type for the provided sward type id.",
      validate: {
        params: Joi.object({
          swardTypeId: Joi.number()
            .integer()
            .required()
            .description("The Sward Type Id of the field."),
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
    path: "/vendors/rb209/Grass/SwardTypes",
    handler: async (request, h) => {
      const controller = new RB209GrassController(request, h);
      return controller.getSwardTypesForField(request, h);
    },
    options: {
      tags: ["api", "RB209 Grass"],
      description:
        "The list of different sward types available for grass fields.",
      validate: {
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

  // {
  //   method: "GET",
  //   path: "/vendors/rb209/Grass/YieldRangesEnglandAndWales",
  //   handler: async (request, h) => {
  //     const controller = new RB209GrassController(request, h);
  //     return controller.getYieldRangesForGrassFields(request, h);
  //   },
  //   options: {
  //     tags: ["api", "RB209 Grass"],
  //     description: "The list of yield ranges for grass fields in England and Wales.",
  //     validate: {
  //       query: Joi.object({
  //         sequenceId: Joi.number()
  //           .integer(),
  //         grassGrowthClassId: Joi.number()
  //           .integer(),
  //       }),
  //       failAction: (request, h, err) => {
  //         return h
  //           .response(
  //             formatErrorResponse({
  //               source: {
  //                 error: err,
  //               },
  //               request,
  //             })
  //           )
  //           .code(400)
  //           .takeover();
  //       },
  //     },
  //   },
  // },
  {
    method: "GET",
    path: "/vendors/rb209/Grass/YieldRangesEnglandAndWales/{sequenceId}/{grassGrowthClassId}",
    handler: async (request, h) => {
      const controller = new RB209GrassController(request, h);
      return controller.getYieldRangesForGrassFields(request, h);
    },
    options: {
      tags: ["api", "RB209 Grass"],
      description:
        "The list of yield ranges for grass fields in England and Wales.",
      validate: {
        params: Joi.object({
          sequenceId: Joi.number()
            .integer()
            .required()
            .description("The ID of the defoliation sequence."),
          grassGrowthClassId: Joi.number()
            .integer()
            .required()
            .description("The ID of the grass growth class."),
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
