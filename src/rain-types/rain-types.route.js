const { RainTypeController } = require("./rain-types.controller");

module.exports = [
  {
    method: "GET",
    path: "/rain-types/default",
    options: {
      tags: ["api", "RainTypes"],
      description: "Get default RainType",
    },
    handler: async (request, h) => {
      const controller = new RainTypeController(request, h);
      return controller.findFirstRow();
    },
  },
  {
    method: "GET",
    path: "/rain-types",
    options: {
      tags: ["api", "RainTypes"],
      description: "Get all RainTypes data",
    },
    handler: async (request, h) => {
      const controller = new RainTypeController(request, h);
      return controller.findAll();
    },
  },
];
