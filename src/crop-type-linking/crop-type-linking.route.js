const Joi = require("joi");
const {
  CropTypeLinkingsController,
} = require("./crop-type-linking.controller");
const { formatErrorResponse } = require("../interceptor/responseFormatter");

const getController = (request, h) =>
  new CropTypeLinkingsController(request, h);
const BAD_REQUEST = 400;
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
              }),
            )
            .code(BAD_REQUEST)
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
        query: Joi.object({
          countryID: Joi.number().required(),
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
  },
  {
    method: "GET",
    path: "/crop-type-linkings",
    handler: async (request, h) => {
      return getController(request, h).getCropTypeLinking();
    },
    options: {
      tags: ["api", "Crop Type Linkings"],
      description: "Get CropTypeLinking",
      validate: {
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
  },
  {
    method: "GET",
    path: "/scotland-nmax-values/{cropTypeId}",
    handler: async (request, h) => {
      return getController(request, h).getScotlandNmaxByCropTypeID();
    },
    options: {
      tags: ["api", "Scotland nmax values"],
      description:
        "Get Scotland nmax values by CropTypeID, SoilTypeId and ResidueGroup",
      validate: {
        params: Joi.object({
          cropTypeId: Joi.number().integer().required(),
        }),
        query: Joi.object({
          soilTypeId: Joi.number().integer().required(),
          residueGroup: Joi.number().integer().required(),
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
  },
];
