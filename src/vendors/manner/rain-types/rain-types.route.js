const Joi = require("joi"); // For validation
const MannerRainTypesController = require("./rain-types.controller");
const mannerRainTypeTag = "Manner rain-types"
module.exports = [
  {
    method: "GET",
    path: "/vendors/manner/rain-types",
    handler: async (request, h) => {
      const controller = new MannerRainTypesController(request, h);
      return controller.getAllRainTypes(request, h);
    },
    options: {
      tags: ["api", mannerRainTypeTag],
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
      tags: ["api", mannerRainTypeTag],
      description: "Retrieve rain types by Id'",
      validate: {
        params: Joi.object({
          id: Joi.number().required(),
        }),
      },
    },
  },
  {
    method: "GET",
    path: "/vendors/manner/rain-types/default",
    options: {
      tags: ["api", mannerRainTypeTag],
      description: "Get default RainType",
    },
    handler: async (request, h) => {
      const controller = new MannerRainTypesController(request, h);
      return controller.findFirstRow();
    },
  },
];
