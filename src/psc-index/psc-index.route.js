
const Joi = require("joi");
const { formatErrorResponse } = require("../interceptor/responseFormatter");
const { StatusCodeMapper } = require("../constants/http-status-codes-mapper");
const {  PscIndexController } = require("./psc-index.controller");



module.exports = [
  {
    method: "GET",
    path: "/psc-indexes",
    options: {
      tags: ["api", "Psc Indexes"],
      description: "Get all Psc Indexes",
    },
    handler: async (request, h) => {
      const controller = new PscIndexController(request, h);
      return controller.getAll();
    },
  },
  {
    method: "GET",
    path: "/psc-indexes/{id}",
    options: {
      tags: ["api", "Psc Indexes"],
      description: "Get Psc Indexes by ID",
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
              }),
            )
            .code(StatusCodeMapper.BAD_REQUEST)
            .takeover();
        },
      },
    },
    handler: async (request, h) => {
      const controller = new PscIndexController(request, h);
      return controller.getById();
    },
  },
];
