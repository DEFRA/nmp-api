const Joi = require("joi");
const { WarningMessageController } = require("./warning-message.controller");
const { WarningMessageDto } = require("./dto/warning-message.dto");
const { formatErrorResponse } = require("../interceptor/responseFormatter");
const BAD_REQUEST = 400;
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
                  .pattern(/^\d+(,\d+)*$/) // Validate FieldIDs (comma-separated)
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
            .code(BAD_REQUEST)
            .takeover();
        },
      },
    },
    handler: async (request, h) => {
      const controller = new WarningMessageController(request, h);
      return controller.getWarningMessageByFieldIdAndYear();
    },
  }
];