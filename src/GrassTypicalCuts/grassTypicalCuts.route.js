const { GrassTypicalCutsController } = require("./grassTypicalCuts.controller");


module.exports = [
  {
    method: "GET",
    path: "/grassTypicalCuts",
    options: {
      tags: ["api", "Grass Typical Cuts "],
      description: "Get all GrassTypicalCuts data",
    },
    handler: async (request, h) => {
      const controller = new GrassTypicalCutsController(request, h);
      return controller.findAll();
    },
  },
];
