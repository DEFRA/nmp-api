const Joi = require("joi");
const {
  FertiliserManuresController,
} = require("./fertiliser-manures.controller");
const {
  CreateFertiliserManuresDto,
  updateFertiliserManuresDto,
  UpdateFertiliserManuresDto,
} = require("./dto/fertiliser-manures.dto");
const { formatErrorResponse } = require("../interceptor/responseFormatter");

const getController = (request, h) =>
  new FertiliserManuresController(request, h);

module.exports = [
  {
    method: "GET",
    path: "/fertiliser-manures/total-nitrogen/{fieldId}",
    handler: async (request, h) => {
      return getController(request, h).getFertiliserManureNitrogenSum();
    },
    options: {
      tags: ["api", "Fertiliser Manures"],
      description: "Get Fertiliser Manure Total Nitrogen by field ID",
      validate: {
        params: Joi.object({
          fieldId: Joi.number().required(),
        }),
        query: Joi.object({
          fromDate: Joi.date().iso().required(),
          toDate: Joi.date().iso().required(),
          confirm: Joi.boolean().required(),
          fertiliserId: Joi.number().optional().allow(null),
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
    path: "/fertiliser-manures/organic-manures/total-nitrogen/{managementPeriodID}",
    handler: async (request, h) => {
      return getController(request, h).getTotalNitrogen();
    },
    options: {
      tags: ["api", "Fertiliser Manures"],
      description:
        "Get total nitrogen from both Fertiliser and Organic Manures by Management Period ID",
      validate: {
        params: Joi.object({
          managementPeriodID: Joi.number().required(),
        }),
        query: Joi.object({
          confirm: Joi.boolean().required(),
          fertiliserID: Joi.number().integer().allow(null).optional(),
          organicManureID: Joi.number().integer().allow(null).optional(),
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
    method: "POST",
    path: "/fertiliser-manures",
    handler: async (request, h) => {
      return getController(request, h).createFertiliserManure();
    },
    options: {
      tags: ["api", "Fertiliser Manures"],
      description: "Create Fertiliser Manures",
      validate: {
        payload: CreateFertiliserManuresDto,
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
    path: "/fertiliser-manures/{fertiliserId}",
    options: {
      tags: ["api", "Fertiliser Manures"],
      description: "Get fertliser by ID",
      validate: {
        params: Joi.object({
          fertiliserId: Joi.number().integer().required(),
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
      return getController(request, h).getFertiliserById();
    },
  },
  {
    method: "GET",
    path: "/fertiliser-manures/FertliserData/{fertiliserId}",
    options: {
      tags: ["api", "Fertiliser Manures"],
      description: "Get fertliser by farmId and harvest year",
      validate: {
        params: Joi.object({
          fertiliserId: Joi.number().integer().required(),
        }),
        query: Joi.object({
          farmId: Joi.number().integer().required(),
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
    handler: async (request, h) => {
      const controller = new FertiliserManuresController(request, h);
      return controller.getFertiliserByFarmIdAndYear();
    },
  },
  {
    method: "PUT",
    path: "/fertiliser-manures",
    handler: async (request, h) => {
      const controller = new FertiliserManuresController(request, h);
      return controller.updateFertiliser();
    },
    options: {
      tags: ["api", "Fertiliser Manures"],
      description: "Update Fertiliser Manures by Id",
      validate: {
        payload: UpdateFertiliserManuresDto,
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
    method: "DELETE",
    path: "/fertiliser-manures/",
    options: {
      tags: ["api", "Fertiliser Manures"],
      description: "Delete Fertiliser Manures by fertiliserManure Ids",
      validate: {
        payload: Joi.object({
          fertliserManureIds: Joi.array()
            .items(Joi.number().integer().required())
            .min(1)
            .required()
            .description(
              "Array of fertiliserManure IDs to delete, e.g., [1, 2, 3]"
            ),
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
      return getController(request, h).deleteFertiliserManureByIds();
    },
  },
  {
    method: "GET",
    path: "/fertiliser-manures/total-nitrogen-by/{managementPeriodID}",
    handler: async (request, h) => {
      return getController(request, h).getTotalNitrogenByManagementPeriodID();
    },
    options: {
      tags: ["api", "Fertiliser Manures"],
      description: "Get Fertiliser Manure Total Nitrogen by managementPeriodID",
      validate: {
        params: Joi.object({
          managementPeriodID: Joi.number().required(),
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
