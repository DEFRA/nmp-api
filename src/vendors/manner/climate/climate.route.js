const Joi = require("joi"); // For validation
const MannerClimateController = require("./climate.controller");

module.exports = [
  {
    method: "GET",
    path: "/vendors/manner/climates/{postcode}",
    handler: async (request, h) => {
      const controller = new MannerClimateController(request, h);
      return controller.getAllClimatesListByPostCode(request, h);
    },
    options: {
      tags: ["api", "Manner climates"],
      description: "climates list",
      validate: {
        params: Joi.object({
          postcode: Joi.string().required(),
        }),
      },
    },
  },
  {
    method: "GET",
    path: "/vendors/manner/climates/avarage-annual-rainfall/{postcode}",
    handler: async (request, h) => {
      const controller = new MannerClimateController(request, h);
      return controller.getAverageAnnualRainfallByPostCode(request, h);
    },
    options: {
      tags: ["api", "Manner climates"],
      description: "Retrieve average annual rainfall by postcode",
      validate: {
        params: Joi.object({
          postcode: Joi.string().required(),
        }),
      },
    },
  },
];
