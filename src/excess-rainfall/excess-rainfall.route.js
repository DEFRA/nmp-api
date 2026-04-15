const Joi = require("joi");
const { formatErrorResponse } = require("../interceptor/responseFormatter");
const { ExcessRainfallController } = require("./excess-rainfall.controller");
const { ExcessRainfallDto } = require("./dto/excess-rainfall.dto");
const { validationFailAction } = require("../shared/validateFailSafeAction");
const excessWinterRailfallPath = "/excessRainfalls/{farmId}";

module.exports = [
  {
    method: "GET",
    path: excessWinterRailfallPath,
    options: {
      tags: ["api", "ExcessRainfalls"],
      description: "Get ExcessRainfalls by FarmID and Year",
      validate: {
        params: Joi.object({
          farmId: Joi.number().integer().required(),
        }),
        query: Joi.object({
          year: Joi.number().integer().required(), // Expecting year as a query parameter
        }),
        failAction: validationFailAction,
      },
    },
    handler: async (request, h) => {
      const controller = new ExcessRainfallController(request, h);
      return controller.getExcessRainfallByFarmIdAndYear();
    },
  },
  {
    method: "POST",
    path: excessWinterRailfallPath,
    options: {
      tags: ["api", "ExcessRainfalls"],
      description: "Create ExcessRainfalls by FarmID and Year",
      validate: {
        params: Joi.object({
          farmId: Joi.number().integer().required(),
        }),
        query: Joi.object({
          year: Joi.number().integer().required(), // Add validation for the year query parameter
        }),
        payload: ExcessRainfallDto, // Schema to validate the request body
        failAction: validationFailAction,
      },
    },
    handler: async (request, h) => {
      const controller = new ExcessRainfallController(request, h);
      return controller.createExcessRainfall();
    },
  },
  {
    method: "PUT",
    path: excessWinterRailfallPath,
    options: {
      tags: ["api", "ExcessRainfalls"],
      description: "Update ExcessRainfalls by FarmID and Year",
      validate: {
        params: Joi.object({
          farmId: Joi.number().integer().required(),
        }),
        query: Joi.object({
          year: Joi.number().integer().required(), // Add validation for the year query parameter
        }),
        payload: ExcessRainfallDto, // Validate payload with UpdateFieldDtoSchema
        failAction: validationFailAction
      },
    },
    handler: async (request, h) => {
      const controller = new ExcessRainfallController(request, h);
      return controller.updateExcessRainfall();
    },
  },
];
