const Joi = require("joi");
const { PreviousCroppingController } = require("./previous-cropping.controller");
const { CreatePreviousCroppingDto } = require("./dto/previous-cropping.dto");
const { formatErrorResponse } = require("../interceptor/responseFormatter");

module.exports = [
{
    method: "GET",
    path: "/previous-cropping/{fieldId}",
    options: {
      tags: ["api", "Previous Cropping"],
      description: "Get previous croppping data by Field ID and Year",
      validate: {
        params: Joi.object({
          fieldId: Joi.number().integer().required(),
        }),
        query: Joi.object({
          year: Joi.number().integer().required(), // Expecting year as a query parameter
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
      const controller = new PreviousCroppingController(request, h);
      return controller.getPreviousCroppingDataByFieldIdAndYear();
    },
  },
  {
    method: "PUT",
    path: "/previous-cropping/mergePreviousCrop",
    handler: async (request, h) => {
      const controller = new PreviousCroppingController(request, h);
      return controller.mergePreviousCropping();
    },
    options: {
      tags: ["api", "Previous Cropping"],
      description: "Merge Previous Cropping",
      validate: {
        payload: CreatePreviousCroppingDto,
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
  },
  
];