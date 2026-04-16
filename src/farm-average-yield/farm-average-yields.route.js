
const Joi = require("joi");
const { formatErrorResponse } = require("../interceptor/responseFormatter");
const { validationFailAction } = require("../shared/validateFailSafeAction");
const { FarmAverageYieldsController } = require("./farm-average-yields.controller");
const { CreateFarmAverageYieldDto } = require("./dto/create-farm-average-yield.dto");

module.exports = [
  {
    method: "POST",
    path: "/farm-average-yields",
    handler: async (request, h) => {
      const controller = new FarmAverageYieldsController(request, h);

      return controller.createFarmAverageYield();
    },
    options: {
      tags: ["api", "Farm Average Yields"],
      description: "Create Farm Average Yield",
      validate: {
        payload: CreateFarmAverageYieldDto,
        failAction: validationFailAction
      },
    },
  },
  {
    method: "GET",
    path: "/farm-average-yields/{farmID}",
    handler: async (request, h) => {
      const controller = new FarmAverageYieldsController(request, h);
      return controller.getByFarmIdAndHarvestYear();
    },
    options: {
      tags: ["api", "Farm Average Yields"],
      description: "Get Farm Average Yields by FarmID and HarvestYear",
      validate: {
        params: Joi.object({
          farmID: Joi.number().integer().required(),
        }),
        query: Joi.object({
          harvestYear: Joi.number().integer().required()
        }),
        failAction: validationFailAction
      },
    },
  },
];
