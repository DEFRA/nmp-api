const Joi = require("joi");
const { formatErrorResponse } = require("../interceptor/responseFormatter");
const {
  CreateOrganicManuresWithFarmManureTypeDtoSchema,
} = require("./dto/farm-manure-type.dto");
const { FarmManureTypeController } = require("./farm-manure-type.controller");
const getController = (request, h) => new FarmManureTypeController(request, h);

// Define routes
module.exports = [
  {
    method: "GET",
    path: "/farm-manure-type/{farmId}",
    options: {
      tags: ["api", "Farm Manure Type"],
      description: "Get FarmManureType by FarmId",
      validate: {
        params: Joi.object({
          farmId: Joi.number().integer().required(),
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
      handler: async (request, h) => {
        return getController(request, h).getFarmManureTypeByFarmId();
      },
    },
  }
];