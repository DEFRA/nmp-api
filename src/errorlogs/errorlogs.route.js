const Joi = require("joi");
const { LogsController } = require("./errorlogs.controller");
const { formatErrorResponse } = require("../interceptor/responseFormatter");

const BAD_REQUEST = 400;

module.exports = [
  {
    method: "GET",
    path: "/logs",
    options: {
      tags: ["api", "Logs"],
      description: "Get logs by date from all log files",
      validate: {
        query: Joi.object({
          date: Joi.string()
            .pattern(/^\d{4}-\d{2}-\d{2}$/)
            .required(),
        }),
        failAction: (request, h, err) => {
          return h
            .response(
              formatErrorResponse({
                source: {
                  error: err,
                },
                request,
              }),
            )
            .code(BAD_REQUEST)
            .takeover();
        },
      },
    },
    handler: async (request, h) => {
      const controller = new LogsController(request, h);
      return controller.getLogsByDate();
    },
  },
];
