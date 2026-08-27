const Joi = require("joi");
const { formatErrorResponse } = require("../interceptor/responseFormatter");
const {
  SoilAnalysesMethodController,
} = require("./soil-analyses-method.controller");
const { StatusCodeMapper } = require("../constants/http-status-codes-mapper");

const handleValidationError = (request, h, err) =>
  h
    .response(
      formatErrorResponse({
        source: { error: err },
        request,
      }),
    )
    .code(StatusCodeMapper.BAD_REQUEST)
    .takeover();

const getController = (request, h) =>
  new SoilAnalysesMethodController(request, h);

module.exports = [
  {
    method: "GET",
    path: "/soil-analyses-method",
    options: {
      tags: ["api", "Soil Analyses Method"],
      description: "Get all Soil Analyses Method",
    },
    handler: (request, h) => {
      const controller = getController(request, h);
      return controller.getAllSoilAnalysesMethods();
    },
  },
  {
    method: "GET",
    path: "/soil-analyses-method/{id}",
    options: {
      tags: ["api", "Soil Analyses Method"],
      description: "Get Soil Analyses Method by ID",
      validate: {
        params: Joi.object({
          id: Joi.number().integer().required(),
        }),
        failAction: handleValidationError,
      },
    },
    handler: (request, h) => {
      const controller = getController(request, h);
      return controller.getSoilAnalysesMethodById();
    },
  },
];
