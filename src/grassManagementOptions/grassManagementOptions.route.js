const { GrassManagementOptionsController } = require("./grassManagementOptions.controller");
const grassManagementTag ="Grass Management "

module.exports = [
  {
    method: "GET",
    path: "/grassland/grassManagementOptions",
    options: {
      tags: ["api", grassManagementTag],
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
      tags: ["api", grassManagementTag],
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
      tags: ["api", grassManagementTag],
      description: "Get all SoilNitrogenSupply data",
    },
    handler: async (request, h) => {
      const controller = new GrassManagementOptionsController(request, h);
      return controller.findAllSoilNitrogenSupplyItems();
    },
  },
];
