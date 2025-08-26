const Joi = require("joi");
const { formatErrorResponse } = require("../interceptor/responseFormatter");
const { StoreCapacitiesController } = require("./store-capacities.controller");

module.exports = [
  {
    method: "GET",
    path: "/store-capacities",
    options: {
      tags: ["api", "Store Capacities"],
      description: "Get all store capacities",
    },
    handler: async (request, h) => {
      const controller = new StoreCapacitiesController(request, h);
      return controller.getAll();
    },
  },
  {
    method: "GET",
    path: "/store-capacities/{farmId}/{year}",
    options: {
      tags: ["api", "Store Capacities"],
      description: "Get store capacity by farmId and year",
      validate: {
        params: Joi.object({
          farmId: Joi.number().required(),
          year: Joi.number().required(),
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
    handler: async (request, h) => {
      const controller = new StoreCapacitiesController(request, h);
      return controller.getById();
    },
  },
];
