const Joi = require("joi");

const { formatErrorResponse } = require("../interceptor/responseFormatter");
const { CountryController } = require("./country.controller");
const getController = (request, h) => new CountryController(request, h);

module.exports = [
  {
    method: "GET",
    path: "/country",
    options: {
      tags: ["api", "Country"],
      description: "Get all countries",
    },
    handler: async (request, h) => {
      return getController(request, h).getAll();
    },
  },
];
