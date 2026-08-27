const Joi = require("joi");
const { formatErrorResponse } = require("../interceptor/responseFormatter");
const { MaterialStatesController } = require("./material-states.controller");
const { validationFailAction } = require("../shared/validateFailSafeAction");


module.exports = [
  {
    method: "GET",
    path: "/material-states",
    options: {
      tags: ["api", "MaterialStates"],
      description: "Get all Material States",
    },
    handler: async (request, h) => {
      const controller = new MaterialStatesController(request, h);
      return controller.getAll();
    },
  },
  {
    method: "GET",
    path: "/material-states/{id}",
    options: {
      tags: ["api", "MaterialStates"],
      description: "Get Material State by ID",
      validate: {
        params: Joi.object({
          id: Joi.number().integer().required(),
        }),
        failAction: validationFailAction
      }
    },
    handler: async (request, h) => {
      const controller = new MaterialStatesController(request, h);
      return controller.getById();
    },
  },
];
