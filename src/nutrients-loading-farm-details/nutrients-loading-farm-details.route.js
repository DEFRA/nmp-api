const Joi = require("joi");
const {
  NutrientsLoadingFarmDetailsController,
} = require("./nutrients-loading-farm-details.controller");

const { NutrientsLoadingFarmDetailsDto } = require("./dto/nutrients-loading-farm-details.dto");
const { formatErrorResponse } = require("../interceptor/responseFormatter");


module.exports = [
  {
    method: "GET",
    path: "/nutrientsLoadingFarmDetails/{farmId}",
    options: {
      tags: ["api", "NutrientsLoadingFarmDetails"],
      description: "Get NutrientsLoadingFarmDetails by FarmID and Year",
      validate: {
        params: Joi.object({
          farmId: Joi.number().integer().required(),
        }),
        query: Joi.object({
          year: Joi.number().integer().required()
        }),
        failAction: (request, h, err) =>
          h
            .response(formatErrorResponse({ source: { error: err }, request }))
            .code(400)
            .takeover(),
      },
    },
    handler: async (request, h) => {
      const controller = new NutrientsLoadingFarmDetailsController(request, h);
      return controller.getByFarmIdAndYear();
    },
  },

  {
    method: "GET",
    path: "/nutrientsLoadingFarmDetailsByFarmId/{farmId}",
    options: {
      tags: ["api", "NutrientsLoadingFarmDetails"],
      description: "Get NutrientsLoadingFarmDetails by FarmID ",
      validate: {
        params: Joi.object({
          farmId: Joi.number().integer().required(),
        }),
        failAction: (request, h, err) =>
          h
            .response(formatErrorResponse({ source: { error: err }, request }))
            .code(400)
            .takeover(),
      },
    },
    handler: async (request, h) => {
      const controller = new NutrientsLoadingFarmDetailsController(request, h);
      return controller.getByFarmId();
    },
  },

  // POST (farmId and year from payload)
  {
    method: "POST",
    path: "/nutrientsLoadingFarmDetails",
    options: {
      tags: ["api", "NutrientsLoadingFarmDetails"],
      description: "Create NutrientsLoadingFarmDetails",
      validate: {
        payload: NutrientsLoadingFarmDetailsDto,
        failAction: (request, h, err) =>
          h
            .response(formatErrorResponse({ source: { error: err }, request }))
            .code(400)
            .takeover(),
      },
    },
    handler: async (request, h) => {
      const controller = new NutrientsLoadingFarmDetailsController(request, h);
      return controller.createNutrientsLoadingFarmDetails();
    },
  },

  // PUT (farmId and year from payload)
  {
    method: "PUT",
    path: "/nutrientsLoadingFarmDetails",
    options: {
      tags: ["api", "NutrientsLoadingFarmDetails"],
      description: "Update NutrientsLoadingFarmDetails",
      validate: {
        payload: NutrientsLoadingFarmDetailsDto,
        failAction: (request, h, err) =>
          h
            .response(formatErrorResponse({ source: { error: err }, request }))
            .code(400)
            .takeover(),
      },
    },
    handler: async (request, h) => {
      const controller = new NutrientsLoadingFarmDetailsController(request, h);
      return controller.updateNutrientsLoadingFarmDetails();
    },
  },
];
