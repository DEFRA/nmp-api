const Joi = require("joi");
const {
  NutrientsLoadingLiveStocksController,
} = require("./nutrients-loading-live-stocks.controller");
const {
  createNutrientsLoadingLiveStocks,
} = require("./dto/nutrients-loading-live-stocks.dto");

const { formatErrorResponse } = require("../interceptor/responseFormatter");


module.exports = [
  {
    method: "GET",
    path: "/nutrients-loading-live-stocks/{farmId}",
    options: {
      description: "Get Nutrients Loading Live Stocks by FarmID and Year",
      tags: ["api", "NutrientsLoadingLiveStocks"],
      validate: {
        params: Joi.object({
          farmId: Joi.number().integer().required(),
        }),
        query: Joi.object({
          year: Joi.number().integer().optional(),
        }),
      },
      handler: (request, h) =>
        new NutrientsLoadingLiveStocksController(
          request,
          h
        ).getByFarmIdAndYear(),
    },
  },
  {
    method: "GET",
    path: "/nutrients-loading-live-stocks-by-id/{id}",
    options: {
      tags: ["api", "NutrientsLoadingLiveStocks"],
      description: "Get Nutrients Loading Live Stocks By ID",
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
      const controller = new NutrientsLoadingLiveStocksController(request, h);
      return controller.getById();
    },
  },
  {
    method: "POST",
    path: "/nutrients-loading-live-stocks",
    options: {
      description: "Create Nutrients Live Stocks",
      tags: ["api", "NutrientsLoadingLiveStocks"],

      validate: {
        payload: createNutrientsLoadingLiveStocks,
      },
      handler: (request, h) =>
        new NutrientsLoadingLiveStocksController(
          request,
          h
        ).createNutrientsLiveStocks(),
    },
  },

  {
    method: "PUT",
    path: "/nutrients-loading-live-stocks",
    options: {
      tags: ["api", "NutrientsLoadingLiveStocks"],
      description: "Update Nutrients Live Stocks",
      validate: {
        payload: createNutrientsLoadingLiveStocks,
        failAction: (request, h, err) =>
          h
            .response(formatErrorResponse({ source: { error: err }, request }))
            .code(400)
            .takeover(),
      },
    },
    handler: async (request, h) => {
      const controller = new NutrientsLoadingLiveStocksController(request, h);
      return controller.updateNutrientsLoadingLiveStocks();
    },
  },
  {
    method: "DELETE",
    path: "/nutrients-loading-live-stocks/{nutrientsLoadingLivestockId}",
    options: {
      tags: ["api", "NutrientsLoadingLiveStocks"],
      description:
        "Delete NutrientsLoadingLivestock by NutrientsLoadingLivestockId",
      validate: {
        params: Joi.object({
          nutrientsLoadingLivestockId: Joi.number().integer().required(),
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
    handler: (request, h) =>
      new NutrientsLoadingLiveStocksController(
        request,
        h
      ).deleteNutrientsLoadingLivestockById(),
  },
];
