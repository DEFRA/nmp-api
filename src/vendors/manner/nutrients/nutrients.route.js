const Joi = require("joi"); // For validation
const MannerApiNutrientsController = require("./nutrients.controller");

module.exports = [
  {
    method: "GET",
    path: "/vendors/manner/nutrients",
    handler: async (request, h) => {
      const controller = new MannerApiNutrientsController(request, h);
      return controller.getAllNutrients(request, h);
    },
    options: {
      tags: ["api", "Manner Nutrients"],
      description: "Retrieve all nutrients",
    },
  },
  {
    method: "GET",
    path: "/vendors/manner/nutrients/{id}",
    handler: async (request, h) => {
      const controller = new MannerApiNutrientsController(request, h);
      return controller.getNutrientsById(request, h);
    },
    options: {
      tags: ["api", "Manner Nutrients"],
      description: "Retrieve Nutrients by ID'",
      validate: {
        params: Joi.object({
          id: Joi.number().required(),
        }),
      },
    },
  },
];
