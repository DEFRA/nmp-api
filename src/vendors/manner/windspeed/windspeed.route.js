const Joi = require("joi"); // For validation
const MannerWindspeedController = require("./windspeed.controller");
module.exports = [
  {
    method: "GET",
    path: "/vendors/manner/windspeeds",
    handler: async (request, h) => {
      const controller = new MannerWindspeedController(request, h);
      return controller.getAllWindspeeds(request, h);
    },
    options: {
      tags: ["api", "Manner windspeed"],
      description: "Retrieve all windspeeds",
    },
  },
  {
    method: "GET",
    path: "/vendors/manner/windspeeds/{id}",
    handler: async (request, h) => {
      const controller = new MannerWindspeedController(request, h);
      return controller.getWindspeedById(request, h);
    },
    options: {
      tags: ["api", "Manner windspeed"],
      description: "Retrieve windspeed by Id'",
      validate: {
        params: Joi.object({
          id: Joi.number().required(),
        }),
      },
    },
  },
];
