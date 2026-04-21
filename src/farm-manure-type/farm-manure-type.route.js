const Joi = require("joi");
const { formatErrorResponse } = require("../interceptor/responseFormatter");
const {
  CreateOrganicManuresWithFarmManureTypeDtoSchema,
} = require("./dto/farm-manure-type.dto");
const { FarmManureTypeController } = require("./farm-manure-type.controller");
const { validationFailAction } = require("../shared/validateFailSafeAction");
const getController = (request, h) => new FarmManureTypeController(request, h);
const farmManureType="Farm Manure Type";

// Define routes
module.exports = [
  {
    method: "GET",
    path: "/farm-manure-type/{farmId}",
    options: {
      tags: ["api", `${farmManureType}`],
      description: "Get FarmManureType by FarmId",
      validate: {
        params: Joi.object({
          farmId: Joi.number().integer().required(),
        }),
        failAction: validationFailAction,
      },
      handler: async (request, h) => {
        return getController(request, h).getFarmManureTypeByFarmId();
      },
    },
  },
  {
    method: "GET",
    path: "/farm-manure-type/check",
    options: {
      tags: ["api", `${farmManureType}`],
      description:
        "Check if FarmManureType exists by FarmID, ManureTypeID, and ManureTypeName",
      validate: {
        query: Joi.object({
          farmId: Joi.number().integer().required(),
          manureTypeId: Joi.number().integer().required(),
          manureTypeName: Joi.string().required(),
        }),
        failAction: validationFailAction,
      },
      handler: async (request, h) => {
        return getController(request, h).checkFarmManureTypeExists();
      },
    },
  },
  {
    method: "GET",
    path: "/farm-manure-type/farm-manure-type-by-id/{farmManureTypeId}",
    options: {
      tags: ["api", `${farmManureType}`],
      description: "Get Farm Manure Type by id",
      validate: {
        params: Joi.object({
          farmManureTypeId: Joi.number().integer().required(),
        }),
        failAction: validationFailAction
      },
    },
    handler: async (request, h) => {
      return getController(request, h).getById();
    },
  },
];
