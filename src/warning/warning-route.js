const Joi = require("joi");
const { formatErrorResponse } = require("../interceptor/responseFormatter");
const { WarningController } = require("./warning-controller");

module.exports = [
  {
    method: "GET",
    path: "/warning/{CountryID}",
    options: {
      tags: ["api", "Warning"],
      description: "Get warning messages by Ccountry id and warning key",
      validate: {
        params: Joi.object({
          CountryID: Joi.number().required(),
        }),
        query: Joi.object({
          WarningKey: Joi.string().required(),
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
            .code(400)
            .takeover();
        },
      },
    },
    handler: async (request, h) => {
      const controller = new WarningController(request, h);
      return controller.getWarningMessageByCountryIdAndKey();
    },
  },
];
