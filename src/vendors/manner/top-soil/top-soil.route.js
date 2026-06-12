const Joi = require("joi"); // For validation
const MannerTopSoilsController = require("./top-soil.controller");
const manngerServiceTag = "Manner Soils";
module.exports = [
  {
    method: "GET",
    path: "/vendors/manner/top-soils",
    handler: async (request, h) => {
      const controller = new MannerTopSoilsController(request, h);
      return controller.getAllSoils(request, h);
    },
    options: {
      tags: ["api", manngerServiceTag],
      description: "Retrieve all top-soils",
    },
  },
  {
    method: "GET",
    path: "/vendors/manner/top-soils/{id}",
    handler: async (request, h) => {
      const controller = new MannerTopSoilsController(request, h);
      return controller.getSoilsById(request, h);
    },
    options: {
      tags: ["api", manngerServiceTag],
      description: "Retrieve top-soil by Id'",
      validate: {
        params: Joi.object({
          id: Joi.number().required(),
        }),
      },
    },
  },
  {
    method: "GET",
    path: "/vendors/manner/sub-soils",
    handler: async (request, h) => {
      const controller = new MannerTopSoilsController(request, h);
      return controller.getAllSoils(request, h);
    },
    options: {
      tags: ["api", manngerServiceTag],
      description: "Retrieve all sub-soils",
    },
  },
  {
    method: "GET",
    path: "/vendors/manner/sub-soils/{id}",
    handler: async (request, h) => {
      const controller = new MannerTopSoilsController(request, h);
      return controller.getSoilsById(request, h);
    },
    options: {
      tags: ["api", manngerServiceTag],
      description: "Retrieve sub-soil by Id'",
      validate: {
        params: Joi.object({
          id: Joi.number().required(),
        }),
      },
    },
  },
];
