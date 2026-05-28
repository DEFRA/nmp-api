const Joi = require("joi");
const { SoilAnalysesController } = require("./soil-analysis.controller");
const { CreateSoilAnalysisDto, UpdateSoilAnalysisDto } = require("./dto/soil-analysis.dto");
const { formatErrorResponse } = require("../interceptor/responseFormatter");
const { validationFailAction } = require("../shared/validateFailSafeAction");
const soilAnalysisTag = "Soil Analysis";
module.exports = [
  {
    method: "GET",
    path: "/soil-analyses/{soilAnalysisId}",
    options: {
      tags: ["api", soilAnalysisTag],
      description: "Get Soil Analysis by Id",
      validate: {
        params: Joi.object({
          soilAnalysisId: Joi.number().required(),
        }),
        failAction: validationFailAction
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
      tags: ["api", soilAnalysisTag],
      description: "Get Soil Analyses by Field Id",
      validate: {
        params: Joi.object({
          fieldId: Joi.number().integer().required(),
        }),
        query: Joi.object({
          shortSummary: Joi.boolean(),
        }),
        failAction: validationFailAction
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
      tags: ["api", soilAnalysisTag],
      description: "Create Soil Analysis",
      validate: {
        payload: CreateSoilAnalysisDto,
        failAction: validationFailAction
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
      tags: ["api", soilAnalysisTag],
      description: "Update Soil Analysis by Id",
      validate: {
        params: Joi.object({
          soilAnalysisId: Joi.number().integer().required(),
        }),
        payload: UpdateSoilAnalysisDto,
        failAction: validationFailAction,
      },
    },
  },

  {
    method: "DELETE",
    path: "/soilAnalysis/{soilAnalysisId}",
    options: {
      tags: ["api", soilAnalysisTag],
      description: "Delete SoilAnalysis by SoilAnalysis Id",
      validate: {
        params: Joi.object({
          soilAnalysisId: Joi.number().integer().required(),
        }),
        failAction: validationFailAction,
      },
    },
    handler: async (request, h) => {
      const controller = new SoilAnalysesController(request, h);
      return controller.deleteSoilAnalysisById();
    },
  },
];
