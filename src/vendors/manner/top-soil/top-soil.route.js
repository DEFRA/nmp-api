const Joi = require("joi"); // For validation
const MannerTopSoilsController = require("./top-soil.controller");
module.exports = [
  {
    method: "GET",
    path: "/vendors/manner/top-soils",
    handler: async (request, h) => {
      const controller = new MannerTopSoilsController(request, h);
      return controller.getAllTopSoils(request, h);
    },
    options: {
      tags: ["api", "Manner top-soils"],
      description: "Retrieve all top-soils",
    },
  },
  {
    method: "GET",
    path: "/vendors/manner/top-soils/{id}",
    handler: async (request, h) => {
      const controller = new MannerTopSoilsController(request, h);
      return controller.getTopSoilsById(request, h);
    },
    options: {
      tags: ["api", "Manner top-soils"],
      description: "Retrieve top-soil by Id'",
      validate: {
        params: Joi.object({
          id: Joi.number().required(),
        }),
      },
    },
  },
];
