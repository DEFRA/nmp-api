const Joi = require("joi");

const { formatErrorResponse } = require("../interceptor/responseFormatter");
const { CountryController } = require("./country.controller");
const getController = (request, h) => new CountryController(request, h);
const BAD_REQUEST=400;
module.exports = [
  {
    method: "GET",
    path: "/countries/all-data",
    options: {
      tags: ["api", "Country"],
      description: "Get all countries",
    },
    handler: async (request, h) => {
      return getController(request, h).getAll();
    },
  },
   {
   method: "GET",
    path: "/countries/By-Id/{id}",
    options: {
      tags: ["api", "Country"],
      description: "Get country data by Id",
      validate: {
        params: Joi.object({
          id: Joi.number().integer().required(),
        }),
        failAction: (request, h, err) => {
          return h
            .response(
              formatErrorResponse({
                source: {
                  error: err,
                },
                request,
              })
            )
            .code(BAD_REQUEST)
            .takeover();
        },
      },
    },
    handler: async (request, h) => {
      const controller = new CountryController(request, h);
      return controller.getCountryById();
    },
  },
];
