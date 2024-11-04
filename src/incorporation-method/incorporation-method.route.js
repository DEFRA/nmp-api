const Joi = require("joi");
const {
  IncorporationMethodController,
} = require("./incorporation-method.controller");
const { formatErrorResponse } = require("../interceptor/responseFormatter");

module.exports = [
  {
    method: "GET",
    path: "/incorporation-methods/{id}",
    handler: async (request, h) => {
      const controller = new IncorporationMethodController(request, h);
      return controller.getIncorporationMethodById();
    },
    options: {
      tags: ["api", "Incorporation Methods"],
      description: "Get Incorporation Method by ID",
      validate: {
        params: Joi.object({
          id: Joi.number()
            .integer()
            .required()
            .description("Incorporation Method ID"),
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
    path: "/incorporation-methods/application-methods/{appId}",
    handler: async (request, h) => {
      const controller = new IncorporationMethodController(request, h);
      return controller.getIncorporationMethods();
    },
    options: {
      tags: ["api", "Incorporation Methods"],
      description: "Get list of Incorporation Methods by Application Id",
      validate: {
        params: Joi.object({
          appId: Joi.number()
            .integer()
            .required()
            .description("Application Method ID"),
        }),
        query: Joi.object({
          applicableFor: Joi.string().required(),
          fieldType: Joi.number()
            .integer()
            .required()
            .description("1 for Arable & Horticulture, 2 for Grassland"),
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
