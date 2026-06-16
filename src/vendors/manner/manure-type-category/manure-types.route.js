const Joi = require("joi"); // For validation
const MannerManureTypesController = require("./manure-types.controller");

module.exports = [
  {
    method: "GET",
    path: "/vendors/manner/manure-type-categories",
    handler: async (request, h) => {
      const controller = new MannerManureTypesController(request, h);
      return controller.getAllManureTypeCategories(request, h);
    },
    options: {
      tags: ["api", "Manner Manure Type Categories"],
      description: "Retrieve all manure type categories",
    },
  },
  {
    method: "GET",
    path: "/vendors/manner/manure-type-categories/{id}",
    handler: async (request, h) => {
      const controller = new MannerManureTypesController(request, h);
      return controller.getManureTypeCategoriesById(request, h);
    },
    options: {
      tags: ["api", "Manner Manure Type Categories"],
      description: "Retrieve manure type categories by ID",
      validate: {
        params: Joi.object({
          id: Joi.number().required(),
        }),
      },
    },
  },
];
