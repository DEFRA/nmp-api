const Joi = require("joi"); // For validation
const MannerCountriesController = require("./countries.controller");

module.exports = [
  {
    method: "GET",
    path: "/vendors/manner/countries",
    handler: async (request, h) => {
      const controller = new MannerCountriesController(request, h);
      return controller.getAllcountries(request, h);
    },
    options: {
      tags: ["api", "Manner Countries"],
      description: "Retrieve all Countries",
    },
  },
  {
    method: "GET",
    path: "/vendors/manner/countries/{id}",
    handler: async (request, h) => {
      const controller = new MannerCountriesController(request, h);
      return controller.getcountriesById(request, h);
    },
    options: {
      tags: ["api", "Manner Countries"],
      description: "Retrieve Countries by ID",
      validate: {
        params: Joi.object({
          id: Joi.number().required(),
        }),
      },
    },
  },
];
