const Joi = require("joi"); // For validation
const MannerApiCropTypesController = require("./crop-types.controller");
module.exports = [
  {
    method: "GET",
    path: "/vendors/manner/crop-types",
    handler: async (request, h) => {
      const controller = new MannerApiCropTypesController(request, h);
      return controller.getAllCropTypes(request, h);
    },
    options: {
      tags: ["api", "Manner crop-types"],
      description: "Retrieve all crop types",
    },
  },
  {
    method: "GET",
    path: "/vendors/manner/crop-types/{id}",
    handler: async (request, h) => {
      const controller = new MannerApiCropTypesController(request, h);
      return controller.getCropTypesById(request, h);
    },
    options: {
      tags: ["api", "Manner crop-types"],
      description: "Retrieve crop type by ID'",
      validate: {
        params: Joi.object({
          id: Joi.number().required(),
        }),
      },
    },
  },
];
