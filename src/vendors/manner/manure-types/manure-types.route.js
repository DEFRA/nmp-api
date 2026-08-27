const Joi = require("joi"); // For validation
const MannerManureTypesController = require("./manure-types.controller");
const { CalculateNutrientsByDryMatterDto } = require("./dto/calculate-nutrients-by-dry-matter.dto");
const mannerManureTypesTag = "Manner manure-types";
module.exports = [
  {
    method: "GET",
    path: "/vendors/manner/manure-types",
    handler: async (request, h) => {
      const controller = new MannerManureTypesController(request, h);
      return controller.getAllManureTypes(request, h);
    },
    options: {
      tags: ["api", mannerManureTypesTag],
      description: "Retrieve all manure types or filter by criteria",
      validate: {
        query: Joi.object({
          id: Joi.number().optional().description("ID of the manure type"),
          name: Joi.string()
            .optional()
            .description("Name of the manure type to filter by"),
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
              "Whether to filter by highly readily available nitrogen (true/false)",
            ),
          isLiquid: Joi.boolean()
            .optional()
            .description(
              "Whether to filter by liquid manure types (true/false)",
            ),
        })
          .rename("manureGroupID", "manureGroupId", {
            alias: false,
            override: true,
            ignoreUndefined: true,
          })
          .rename("manureTypeCategoryID", "manureTypeCategoryId", {
            alias: false,
            override: true,
            ignoreUndefined: true,
          })
          .rename("countryID", "countryId", {
            alias: false,
            override: true,
            ignoreUndefined: true,
          })
          .unknown(true),
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
      tags: ["api", mannerManureTypesTag],
      description: "Retrieve manure types by ID",
      validate: {
        params: Joi.object({
          id: Joi.number().required(),
        }),
      },
    },
  },
  {
    method: "POST",
    path: "/vendors/manner/calculate-nutrients-by-dry-matter-percentage",
    handler: async (request, h) => {
      const controller = new MannerManureTypesController(request, h);
      return controller.calculateNutrientsByDryMatter(request, h);
    },
    options: {
      tags: ["api", mannerManureTypesTag],
      description: "Calculate nutrients by dry matter percentage",
      validate: {
        payload: CalculateNutrientsByDryMatterDto,
      },
    },
  },
];
