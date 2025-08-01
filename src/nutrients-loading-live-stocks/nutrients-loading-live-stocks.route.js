const Joi = require("joi");
const { NutrientsLoadingLiveStocksController } = require("./nutrients-loading-live-stocks.controller");
const {  createNutrientsLoadingLiveStocks } = require("./dto/nutrients-loading-live-stocks.dto");


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
          year: Joi.number().integer().required(),
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
];
 