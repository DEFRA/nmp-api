const MannerApplicationMethodController = require("./application-method.controller");
const Joi = require("joi"); // For validation

module.exports = [
  {
    method: "GET",
    path: "/vendors/manner/application-methods",
    handler: async (request, h) => {
      const controller = new MannerApplicationMethodController(request, h);
      return controller.getAllApplicationMethods(request, h);
    },
    options: {
      tags: ["api", "Manner application-methods"],
      description: "Retrieve all application methods or filter by criteria",
      validate: {
        query: Joi.object({
          isLiquid: Joi.boolean().optional(),
          fieldType: Joi.number().optional(),
        }),
      },
    },
  },
  {
    method: "GET",
    path: "/vendors/manner/application-methods/{id}",
    handler: async (request, h) => {
      const controller = new MannerApplicationMethodController(request, h);
      return controller.getApplicationMethodById(request, h);
    },
    options: {
      tags: ["api", "Manner application-methods"],
      description: "Retrieve application method by ID",
      validate: {
        params: Joi.object({
          id: Joi.number().required(),
        }),
      },
    },
  },
];
