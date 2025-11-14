const Joi = require("joi");
const { WarningMessageController } = require("./warning-message.controller");
const { WarningMessageDto } = require("./dto/warning-message.dto");
const { formatErrorResponse } = require("../interceptor/responseFormatter");

module.exports = [
  {
    method: "GET",
    path: "/warning-message/{fieldId}",
    options: {
      tags: ["api", "Warning Message"],
      description: "Get warning messages by field id and harvest year",
      validate: {
              params: Joi.object({
                fieldId: Joi.string()
                  .pattern(/^[0-9]+(,[0-9]+)*$/) // Validate FieldIDs (comma-separated)
                  .required(),
              }),
        query: Joi.object({
                  harvestYear: Joi.number().integer().required(),
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
      const controller = new WarningMessageController(request, h);
      return controller.getWarningMessageByFieldId();
    },
  }
];