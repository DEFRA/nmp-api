const Joi = require("joi");
const { formatErrorResponse } = require("../interceptor/responseFormatter");
const {
  SolidManureTypesController,
} = require("./solid-manure-types.controller");

module.exports = [
  {
    method: "GET",
    path: "/solid-manure-types",
    options: {
      tags: ["api", "SolidManureTypes"],
      description: "Get all Solid Manure Types",
    },
    handler: async (request, h) => {
      const controller = new SolidManureTypesController(request, h);
      return controller.getAll();
    },
  },
  {
    method: "GET",
    path: "/solid-manure-types/{id}",
    options: {
      tags: ["api", "SolidManureTypes"],
      description: "Get Solid Manure Type by ID",
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
      const controller = new SolidManureTypesController(request, h);
      return controller.getById();
    },
  },
];
