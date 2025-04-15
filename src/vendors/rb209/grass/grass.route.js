const Joi = require("joi");
const {
  formatErrorResponse,
} = require("../../../interceptor/responseFormatter");
const { RB209GrassController } = require("./grass.controller");

module.exports = [
  {
    method: "GET",
    path: "/vendors/rb209/Grass/DefoliationSequence",
    handler: async (request, h) => {
      const controller = new RB209GrassController(request, h);
      return controller.getGrassDefoliationSequence(request, h);
    },
    options: {
      tags: ["api", "RB209 Grass"],
      description:
        "The list of different defoliation sequences available for grass fields.",
      validate: {
        query: Joi.object({
          swardTypeId: Joi.number()
            .integer()
            .description("The Sward Type Id of the field."),
          numberOfCuts: Joi.number()
            .integer()
            .description("The number of cuts made to the field in the season."),
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
    path: "/vendors/rb209/Grass/PotentialCuts",
    handler: async (request, h) => {
      const controller = new RB209GrassController(request, h);
      return controller.getGrassCutsForField(request, h);
    },
    options: {
      tags: ["api", "RB209 Grass"],
      description: "The list of different number of cuts for the field.",
      validate: {
        query: Joi.object({
          swardTypeId: Joi.number()
            .integer()
            .description("The Sward Type Id of the field."),
          swardManagementId: Joi.number()
            .integer()
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


  {
    method: "GET",
    path: "/vendors/rb209/Grass/YieldRangesEnglandAndWales",
    handler: async (request, h) => {
      const controller = new RB209GrassController(request, h);
      return controller.getYieldRangesForGrassFields(request, h);
    },
    options: {
      tags: ["api", "RB209 Grass"],
      description: "The list of yield ranges for grass fields in England and Wales.",
      validate: {
        query: Joi.object({
          sequenceId: Joi.number()
            .integer(),
          grassGrowthClassId: Joi.number()
            .integer(),
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
