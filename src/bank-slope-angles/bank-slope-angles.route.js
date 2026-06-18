const Joi = require("joi");
const { formatErrorResponse } = require("../interceptor/responseFormatter");
const { BankSlopeAnglesController } = require("./bank-slope-angles.controller");

module.exports = [
  {
    method: "GET",
    path: "/bank-slope-angles",
    options: {
      tags: ["api", "BankSlopeAngles"],
      description: "Get all Bank Slope Angles",
    },
    handler: async (request, h) => {
      const controller = new BankSlopeAnglesController(request, h);
      return controller.getAll();
    },
  },
  {
    method: "GET",
    path: "/bank-slope-angles/{id}",
    options: {
      tags: ["api", "BankSlopeAngles"],
      description: "Get Bank Slope Angle by ID",
      validate: {
        params: Joi.object({
          id: Joi.number().integer().required(),
        }),
        failAction: (request, h, err) => {
          return h
            .response(
              formatErrorResponse({
                source: { error: err },
                request,
              })
            )
            .code(400)
            .takeover();
        },
      },
    },
    handler: async (request, h) => {
      const controller = new BankSlopeAnglesController(request, h);
      return controller.getById();
    },
  },
];
