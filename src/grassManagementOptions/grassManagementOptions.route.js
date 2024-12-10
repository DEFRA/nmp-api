const { GrassManagementOptionsController } = require("./grassManagementOptions.controller");


module.exports = [
  {
    method: "GET",
    path: "/grassManagementOptions",
    options: {
      tags: ["api", "Grass Management "],
      description: "Get all GrassManagementOptions data",
    },
    handler: async (request, h) => {
      const controller = new GrassManagementOptionsController(request, h);
      return controller.findAll();
    },
  },
];
