// mannerRoutes.js

const MannerCalculateNutrientsController = require("./calculate-nutrients.controller");
const { CreateManureApplicationDto } = require("./dto/calculate-nutrients.dto");

module.exports = [
  {
    method: "POST",
    path: "/vendors/manner/calculate-nutrients",
    handler: async (request, h) => {
      // Create a new instance of the controller for each request
      const controller = new MannerCalculateNutrientsController(request, h);
      return controller.calculateNutrients();
    },
    options: {
      tags: ["api", "Manner Calculate Nutrients"],
      description: "Calculate Nutrients from manure applications",
      validate: {
        payload: CreateManureApplicationDto,
      },
    },
  },
];
