const Joi = require("joi"); // For validation
const MannerManureTypesController = require("./manure-types.controller");

module.exports = [
  {
    method: "GET",
    path: "/vendors/manner/manure-types",
    handler: async (request, h) => {
      const controller = new MannerManureTypesController(request, h);
      return controller.getAllManureTypes(request, h);
    },
    options: {
      tags: ["api", "Manner manure-types"],
      description: "Retrieve all manure types or filter by criteria",
      validate: {
        query: Joi.object({
          manureGroupId: Joi.string()
            .optional()
            .description("ID of the manure group to filter by"),
          manureTypeCategoryId: Joi.string()
            .optional()
            .description("ID of the manure type category to filter by"),
          countryId: Joi.string()
            .optional()
            .description("ID of the country to filter by"),
          highReadilyAvailableNitrogen: Joi.boolean()
            .optional()
            .description(
              "Whether to filter by highly readily available nitrogen (true/false)"
            ),
          isLiquid: Joi.boolean()
            .optional()
            .description(
              "Whether to filter by liquid manure types (true/false)"
            ),
        }),
      },
    },
  },
  {
    method: "GET",
    path: "/vendors/manner/manure-types/{id}",
    handler: async (request, h) => {
      const controller = new MannerManureTypesController(request, h);
      return controller.getManureTypesById(request, h);
    },
    options: {
      tags: ["api", "Manner manure-types"],
      description: "Retrieve manure types by ID",
      validate: {
        params: Joi.object({
          id: Joi.number().required(),
        }),
      },
    },
  },
];
