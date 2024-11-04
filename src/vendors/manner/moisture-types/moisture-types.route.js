const Joi = require("joi"); // For validation
const MannerMoistureTypesController = require("./moisture-types.controller");

module.exports = [
  {
    method: "GET",
    path: "/vendors/manner/moisture-types",
    handler: async (request, h) => {
      const controller = new MannerMoistureTypesController(request, h);
      return controller.getAllMoistureTypes(request, h);
    },
    options: {
      tags: ["api", "Manner moisture-types"],
      description: "Retrieve all moisture types",
    },
  },
  {
    method: "GET",
    path: "/vendors/manner/moisture-types/{id}",
    handler: async (request, h) => {
      const controller = new MannerMoistureTypesController(request, h);
      return controller.getMoistureTypesById(request, h);
    },
    options: {
      tags: ["api", "Manner moisture-types"],
      description: "Retrieve moisture type by Id'",
      validate: {
        params: Joi.object({
          id: Joi.number().required(),
        }),
      },
    },
  },
];
