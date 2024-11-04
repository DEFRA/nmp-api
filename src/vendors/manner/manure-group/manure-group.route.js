const Joi = require("joi"); // For validation
const MannerManureGroupController = require("./manure-group.controller");

module.exports = [
  {
    method: "GET",
    path: "/vendors/manner/manure-groups",
    handler: async (request, h) => {
      const controller = new MannerManureGroupController(request, h);
      return controller.getAllManureGroups(request, h);
    },
    options: {
      tags: ["api", "Manner Manure Groups"],
      description: "Retrieve all manure methods",
    },
  },
  {
    method: "GET",
    path: "/vendors/manner/manure-groups/{id}",
    handler: async (request, h) => {
      const controller = new MannerManureGroupController(request, h);
      return controller.getManureGroupsById(request, h);
    },
    options: {
      tags: ["api", "Manner Manure Groups"],
      description: "Retrieve manure groups by Id'",
      validate: {
        params: Joi.object({
          id: Joi.number().required(),
        }),
      },
    },
  }
];
