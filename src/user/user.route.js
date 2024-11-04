const Joi = require("joi");
const { UserController } = require("./user.controller");
const { formatErrorResponse } = require("../interceptor/responseFormatter");

module.exports = [
  {
    method: "POST",
    path: "/users",
    options: {
      tags: ["api", "Users"],
      description: "Create User along with Organisation api",
      validate: {
        payload: Joi.object({
          User: Joi.object({
            ID: Joi.number().integer().optional(),
            GivenName: Joi.string().required(),
            Surname: Joi.string().required(),
            Email: Joi.string().email().required(),
            UserIdentifier: Joi.string().guid().required(),
          }).required(),
          Organisation: Joi.object({
            ID: Joi.string().guid().required(),
            Name: Joi.string().required(),
          }).required(),
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
      const controller = new UserController(request, h);
      return controller.createUserWithOrganisation();
    },
  },
];
