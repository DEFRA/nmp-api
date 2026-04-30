const Joi = require("joi");
const { formatErrorResponse } = require("../interceptor/responseFormatter");
const { StorageTypesController } = require("./storage-types.controller");
const { validationFailAction } = require("../shared/validateFailSafeAction");

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
      return controller.getAllStorageTypes();
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
        failAction: validationFailAction
      },
    },
    handler: async (request, h) => {
      const controller = new StorageTypesController(request, h);
      return controller.getStorageTypesById();
    },
  }
];
