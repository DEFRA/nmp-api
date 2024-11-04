const Joi = require("joi");
const {
  ApplicationMethodController,
} = require("./application-method.controller");
const { formatErrorResponse } = require("../interceptor/responseFormatter");

module.exports = [
  {
    method: "GET",
    path: "/application-method",
    handler: async (request, h) => {
      const controller = new ApplicationMethodController(request, h);
      return controller.getApplicationMethods();
    },
    options: {
      tags: ["api", "Application Methods"],
      description: "Get Application Methods",
      validate: {
        query: Joi.object({
          fieldType: Joi.number()
            .integer()
            .required()
            .description("1 for Arable & Horticulture, 2 for Grassland"),
          applicableFor: Joi.string()
            .required()
            .description(
              "Applicable for: L for Liquid, S for Solid, B for Both"
            ),
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
  },
  {
    method: "GET",
    path: "/application-method/{id}",
    handler: async (request, h) => {
      const controller = new ApplicationMethodController(request, h);
      return controller.getApplicationMethodById();
    },
    options: {
      tags: ["api", "Application Methods"],
      description: "Get Application Method by ID",
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
            .code(400)
            .takeover();
        },
      },
    },
  },
];
