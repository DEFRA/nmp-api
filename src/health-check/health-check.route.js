const { HealthCheckController } = require("./health-check.controller");

module.exports = [
  {
    method: "GET",
    path: "/",
    options: {
      tags: ["api", "Health Check"],
    },
    handler: async (request, h) => {
      const controller = new HealthCheckController(request, h);
      return controller.checkAPIHealth();
    },
  },
];
