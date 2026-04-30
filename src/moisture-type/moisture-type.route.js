const Joi = require("joi");
const { MoistureTypeController } = require("./moisture-type.controller");
const { formatErrorResponse } = require("../interceptor/responseFormatter");
const { validationFailAction } = require("../shared/validateFailSafeAction");

module.exports = [
  {
    method: "GET",
    path: "/moisture-types",
    handler: async (request, h) => {
      const controller = new MoistureTypeController(request, h);
      return controller.getSoilMoistureTypes();
    },
    options: {
      tags: ["api", "Moisture Types"],
      description: "Get list of Moisture Types",
      notes: "Returns a list of moisture types",
    },
  },
  {
    method: "GET",
    path: "/moisture-types/default/{date}",
    handler: async (request, h) => {
      const controller = new MoistureTypeController(request, h);
      return controller.getDefaultSoilMoistureType();
    },
    options: {
      tags: ["api", "Moisture Types"],
      description: "Get default Moisture Type based on Application Date",
      validate: {
        params: Joi.object({
          date: Joi.string()
            .isoDate()
            .required()
            .description("Application date (format: YYYY-MM-DD)")
            .messages({
              "string.isoDate": "Date format should be YYYY-MM-DD",
            }),
        }),
        failAction: validationFailAction
      },
    },
  },
];
