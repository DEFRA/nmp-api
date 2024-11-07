// mannerRoutes.js

const { CreateRainfallPostApplicationDto } = require("./dto/rainfall-post-application.dto");
const MannerRainfallPostApplicationController = require("./rainfall-post-application.controller");

module.exports = [
  {
    method: "POST",
    path: "/vendors/manner/rainfall-post-application",
    handler: async (request, h) => {
      // Create a new instance of the controller for each request
      const controller = new MannerRainfallPostApplicationController(
        request,
        h
      );
      return controller.calculateRainfallPostApplicationOfManure();
    },
    options: {
      tags: ["api", "Manner Rainfall Post Application "],
      description: "Calculate Rainfall Post Application of Manure",
      validate: {
        payload: CreateRainfallPostApplicationDto,
      },
    },
  },
];
