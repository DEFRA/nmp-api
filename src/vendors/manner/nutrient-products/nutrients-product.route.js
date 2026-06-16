const Joi = require("joi"); // For validation
const MannerApiNutrientsProductController = require("./nutrients-product.controller");
const mannerNutrientsProductsTag = "Manner Nutrients Products"
module.exports = [
  {
    method: "GET",
    path: "/vendors/manner/nutrient-products",
    handler: async (request, h) => {
      const controller = new MannerApiNutrientsProductController(request, h);
      return controller.getAllNutrientsProducts(request, h);
    },
    options: {
      tags: ["api", mannerNutrientsProductsTag],
      description: "Retrieve all nutrients products",
    },
  },
  {
    method: "GET",
    path: "/vendors/manner/nutrient-products/{id}",
    handler: async (request, h) => {
      const controller = new MannerApiNutrientsProductController(request, h);
      return controller.getNutrientsProductsById(request, h);
    },
    options: {
      tags: ["api", mannerNutrientsProductsTag],
      description: "Retrieve Nutrients Product by ID'",
      validate: {
        params: Joi.object({
          id: Joi.number().required(),
        }),
      },
    },
  },
  {
    method: "GET",
    path: "/vendors/manner/nutrient-products/by-nutrient-id/{nutrientId}",
    handler: async (request, h) => {
      const controller = new MannerApiNutrientsProductController(request, h);
      return controller.getNutrientsProductsByNutrientId(request, h);
    },
    options: {
      tags: ["api", mannerNutrientsProductsTag],
      description: "Retrieve Nutrients Product by Nutrient ID'",
      validate: {
        params: Joi.object({
          nutrientId: Joi.number().required(),
        }),
      },
    },
  },
];
