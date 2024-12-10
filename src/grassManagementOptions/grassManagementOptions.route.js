const { GrassManagementOptionsController } = require("./grassManagementOptions.controller");


module.exports = [
  {
    method: "GET",
    path: "/grassland/grassManagementOptions",
    options: {
      tags: ["api", "Grass Management "],
      description: "Get all GrassManagementOptions data",
    },
    handler: async (request, h) => {
      const controller = new GrassManagementOptionsController(request, h);
      return controller.findAll();
    },
  },
  {
    method: "GET",
    path: "/grassland/grassTypicalCuts",
    options: {
      tags: ["api", "Grass Management "],
      description: "Get all GrassManagementOptions data",
    },
    handler: async (request, h) => {
      const controller = new GrassManagementOptionsController(request, h);
      return controller.findAllgrassTypicalCuts();
    },
  },
  {
    method: "GET",
    path: "/grassland/soilNitrogenSupply",
    options: {
      tags: ["api", "Grass Management "],
      description: "Get all SoilNitrogenSupply data",
    },
    handler: async (request, h) => {
      const controller = new GrassManagementOptionsController(request, h);
      return controller.findAllSoilNitrogenSupplyItems();
    },
  },
];
