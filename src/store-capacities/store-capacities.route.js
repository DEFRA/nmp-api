const Joi = require("joi");
const { formatErrorResponse } = require("../interceptor/responseFormatter");
const { StoreCapacitiesController } = require("./store-capacities.controller");
const { StoreCapacitiesCreateDto, CopyStoreCapacitiesDto } = require("./dto/store-capacities.dto");

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
    path: "/store-capacities/{farmId}",
    options: {
      tags: ["api", "Store Capacities"],
      description: "Get store capacity by farmId",
      validate: {
        params: Joi.object({
          farmId: Joi.number().required(),
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
      return controller.getByFarmId();
    },
  },
  {
    method: "GET",
    path: "/store-capacities/{FarmId}/{StoreName}",
    options: {
      tags: ["api", "Store Capacities"],
      description:
        "Check if store capacity exists by farmId, and storeName",
      validate: {
        params: Joi.object({
          FarmId: Joi.number().required(),
          StoreName: Joi.string().required(),
        }),
        query: Joi.object({
          ID: Joi.number().integer().optional().allow(null),
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
      return controller.checkExistByFarmIdStoreName();
    },
  },
  {
    method: "GET",
    path: "/storage-capacities/{id}",
    options: {
      tags: ["api", "Store Capacities"],
      description: "Get Storage Capacities by ID",
      validate: {
        params: Joi.object({
          id: Joi.number().integer().required(),
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
  {
    method: "POST",
    path: "/storage-capacities/copystoragecapacities",
    handler: async (request, h) => {
      const controller = new StoreCapacitiesController(request, h);
      return controller.copyStorageCapacititesByYearAndFarmID();
    },
    options: {
      tags: ["api", "Store Capacities"],
      description: "copy Store Capacities",
      validate: {
        payload: CopyStoreCapacitiesDto,
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
    path: "/store-capacities",
    options: {
      tags: ["api", "Store Capacities"],
      description: "Create a new store capacity",
      validate: {
        payload: StoreCapacitiesCreateDto,
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
      return controller.create();
    },
  },
  {
    method: "PUT",
    path: "/store-capacities",
    options: {
      tags: ["api", "Store Capacities"],
      description: "Update Store Capacities",
      validate: {
        payload: StoreCapacitiesCreateDto,
        failAction: (request, h, err) =>
          h
            .response(formatErrorResponse({ source: { error: err }, request }))
            .code(400)
            .takeover(),
      },
    },
    handler: async (request, h) => {
      const controller = new StoreCapacitiesController(request, h);
      return controller.updateStoreCapacities();
    },
  },
  {
    method: "DELETE",
    path: "/store-capacities/{storeCapacitiesId}",
    options: {
      tags: ["api", "Store Capacities"],
      description: "Delete Store Capacities by Store Capacity Id ",
      validate: {
        params: Joi.object({
          storeCapacitiesId: Joi.number().integer().required(),
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
    handler: async (request, h) => {
      const controller = new StoreCapacitiesController(request, h);
      return controller.deleteStoreCapacitiesById();
    },
  },
];
