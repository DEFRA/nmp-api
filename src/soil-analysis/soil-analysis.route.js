const Joi = require("joi");
const { SoilAnalysesController } = require("./soil-analysis.controller");
const { CreateSoilAnalysisDto, UpdateSoilAnalysisDto } = require("./dto/soil-analysis.dto");
const { formatErrorResponse } = require("../interceptor/responseFormatter");

module.exports = [
  {
    method: "GET",
    path: "/soil-analyses/{soilAnalysisId}",
    options: {
      tags: ["api", "Soil Analysis"],
      description: "Get Soil Analysis by Id",
      validate: {
        params: Joi.object({
          soilAnalysisId: Joi.number().required(),
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
      const controller = new SoilAnalysesController(request, h);
      return controller.getSoilAnalysisById();
    },
  },
  {
    method: "GET",
    path: "/soil-analyses/fields/{fieldId}",
    options: {
      tags: ["api", "Soil Analysis"],
      description: "Get Soil Analyses by Field Id",
      validate: {
        params: Joi.object({
          fieldId: Joi.number().integer().required(),
        }),
        query: Joi.object({
          shortSummary: Joi.boolean(),
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
      const controller = new SoilAnalysesController(request, h);
      return controller.getSoilAnalysesByFieldId();
    },
  },

  {
    method: "POST",
    path: "/soil-analyses",
    handler: async (request, h) => {
      const controller = new SoilAnalysesController(request, h);
      return controller.createSoilAnalysis();
    },
    options: {
      tags: ["api", "Soil Analysis"],
      description: "Create Soil Analysis",
      validate: {
        payload: CreateSoilAnalysisDto,
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
    method: "PUT",
    path: "/soil-analyses/{soilAnalysisId}",
    handler: async (request, h) => {
      const controller = new SoilAnalysesController(request, h);
      return controller.updateSoilAnalysis();
    },
    options: {
      tags: ["api", "Soil Analysis"],
      description: "Update Soil Analysis by Id",
      validate: {
        params: Joi.object({
          soilAnalysisId: Joi.number().integer().required(),
        }),
        payload: UpdateSoilAnalysisDto,
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
