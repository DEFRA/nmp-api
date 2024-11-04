const { WindspeedController } = require("./wind-speed.controller");

module.exports = [
  {
    method: "GET",
    path: "/windspeeds/default",
    options: {
      tags: ["api", "Wind Speed"],
      description: "Get default windspeed",
    },
    handler: async (request, h) => {
      const controller = new WindspeedController(request, h);
      return controller.findFirstRow();
    },
  },
  {
    method: "GET",
    path: "/windspeeds",
    options: {
      tags: ["api", "Wind Speed"],
      description: "Get all windspeeds data",
    },
    handler: async (request, h) => {
      const controller = new WindspeedController(request, h);
      return controller.findAll();
    },
  },
];
