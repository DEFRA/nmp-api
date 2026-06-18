const Joi = require("joi");
const { formatErrorResponse } = require("../interceptor/responseFormatter");
const { StorageTypesController } = require("./storage-types.controller");

module.exports = [
  {
    method: "GET",
    path: "/storage-types",
    options: {
      tags: ["api", "StorageTypes"],
      description: "Get all Storage Types",
    },
    handler: async (request, h) => {
      const controller = new StorageTypesController(request, h);
      return controller.getAll();
    },
  },
  {
    method: "GET",
    path: "/storage-types/{id}",
    options: {
      tags: ["api", "StorageTypes"],
      description: "Get Storage Type by ID",
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
      const controller = new StorageTypesController(request, h);
      return controller.getById();
    },
  }
];
