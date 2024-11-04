const Joi = require("joi"); // For validation
const MannerRainTypesController = require("./rain-types.controller");

module.exports = [
  {
    method: "GET",
    path: "/vendors/manner/rain-types",
    handler: async (request, h) => {
      const controller = new MannerRainTypesController(request, h);
      return controller.getAllRainTypes(request, h);
    },
    options: {
      tags: ["api", "Manner rain-types"],
      description: "Retrieve all rain types",
    },
  },
  {
    method: "GET",
    path: "/vendors/manner/rain-types/{id}",
    handler: async (request, h) => {
      const controller = new MannerRainTypesController(request, h);
      return controller.getRainTypeById(request, h);
    },
    options: {
      tags: ["api", "Manner rain-types"],
      description: "Retrieve rain types by Id'",
      validate: {
        params: Joi.object({
          id: Joi.number().required(),
        }),
      },
    },
  },
];
