const Joi = require("joi");
const { formatErrorResponse } = require("../interceptor/responseFormatter");
const {
  NutrientsLoadingManuresController,
} = require("./nutrients-loading-manures.controller");
const {
  NutrientsLoadingManuresDto,
  CreateOrUpdateNutrientsLoadingManuresDto,
} = require("./dto/nutrients-loading-manures.dto");

module.exports = [
  {
    method: "GET",
    path: "/nutrientsLoadingManures/{farmID}",
    options: {
      tags: ["api", "NutrientsLoadingManures"],
      description: "Get NutrientsLoadingManures by FarmID",
      validate: {
        params: Joi.object({
          farmID: Joi.number().integer().required(),
        }),
        failAction: (request, h, err) =>
          h
            .response(formatErrorResponse({ source: { error: err }, request }))
            .code(400)
            .takeover(),
      },
    },
    handler: async (request, h) => {
      const controller = new NutrientsLoadingManuresController(request, h);
      return controller.getByFarmIdAndYear();
    },
  },
  {
    method: "GET",
    path: "/nutrientsLoadingManuresById/{id}",
    options: {
      tags: ["api", "NutrientsLoadingManures"],
      description: "Get NutrientsLoadingManures by id",
      validate: {
        params: Joi.object({
          id: Joi.number().integer().required(),
        }),
        failAction: (request, h, err) =>
          h
            .response(formatErrorResponse({ source: { error: err }, request }))
            .code(400)
            .takeover(),
      },
    },
    handler: async (request, h) => {
      const controller = new NutrientsLoadingManuresController(request, h);
      return controller.getById();
    },
  },
  // POST (farmId and year from payload)
  {
    method: "POST",
    path: "/nutrientsLoadingManures",
    options: {
      tags: ["api", "NutrientsLoadingManures"],
      description: "Create NutrientsLoadingManures",
      validate: {
        payload: CreateOrUpdateNutrientsLoadingManuresDto,
        failAction: (request, h, err) =>
          h
            .response(formatErrorResponse({ source: { error: err }, request }))
            .code(400)
            .takeover(),
      },
    },
    handler: async (request, h) => {
      const controller = new NutrientsLoadingManuresController(request, h);
      return controller.createNutrientsLoadingManures();
    },
  },


  {
    method: "PUT",
    path: "/nutrientsLoadingManures",
    options: {
      tags: ["api", "NutrientsLoadingManures"],
      description: "Update NutrientsLoadingManures",
      validate: {
        payload: CreateOrUpdateNutrientsLoadingManuresDto,
        failAction: (request, h, err) =>
          h
            .response(formatErrorResponse({ source: { error: err }, request }))
            .code(400)
            .takeover(),
      },
    },
    handler: async (request, h) => {
      const controller = new NutrientsLoadingManuresController(request, h);
      return controller.updateNutrientsLoadingManures();
    },
  },
  {
    method: "DELETE",
    path: "/nutrientsLoadingManures/{nutrientsLoadingManureId}",
    options: {
      tags: ["api", "NutrientsLoadingManures"],
      description: "Delete NutrientsLoadingManures by NutrientsLoadingManure Id",
      validate: {
        params: Joi.object({
          nutrientsLoadingManureId: Joi.number().integer().required(),
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
      const controller = new NutrientsLoadingManuresController(request, h);
      return controller.deleteNutrientsLoadingManureById();
    },
  },
];
