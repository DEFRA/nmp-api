const Joi = require("joi");
const { formatErrorResponse } = require("../interceptor/responseFormatter");
const { NutrientsLoadingManuresController } = require("./nutrients-loading-manures.controller");
const { NutrientsLoadingManuresDto, CreateNutrientsLoadingManuresDto } = require("./dto/nutrients-loading-manures.dto");

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

  // POST (farmId and year from payload)
  {
    method: "POST",
    path: "/nutrientsLoadingManures",
    options: {
      tags: ["api", "NutrientsLoadingManures"],
      description: "Create NutrientsLoadingManures",
      validate: {
        payload: CreateNutrientsLoadingManuresDto,
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

  // PUT (farmId and year from payload)
  {
    method: "PUT",
    path: "/nutrientsLoadingManures",
    options: {
      tags: ["api", "NutrientsLoadingManures"],
      description: "Update NutrientsLoadingManures",
      validate: {
        payload: NutrientsLoadingManuresDto,
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
];
