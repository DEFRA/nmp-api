const Joi = require("joi");
const {
  CropTypeLinkingsController,
} = require("./crop-type-linking.controller");
const { formatErrorResponse } = require("../interceptor/responseFormatter");

const getController = (request, h) =>
  new CropTypeLinkingsController(request, h);
module.exports = [
  {
    method: "GET",
    path: "/crop-type-linkings/{cropTypeID}",
    handler: async (request, h) => {
      return getController(request, h).getCropTypeLinkingByCropTypeID();
    },
    options: {
      tags: ["api", "Crop Type Linkings"],
      description: "Get CropTypeLinking by CropTypeID",
      validate: {
        params: Joi.object({
          cropTypeID: Joi.number().integer().required(),
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
  },
  {
    method: "GET",
    path: "/crop-info-questions/{cropTypeID}",
    handler: async (request, h) => {
      return getController(request, h).getCropInfoQuestionsByCropTypeID();
    },
    options: {
      tags: ["api", "Crop Info Questions"],
      description: "Get CropInfoQuestions by CropTypeID",
      validate: {
        params: Joi.object({
          cropTypeID: Joi.number().integer().required(),
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
  },
];
