const Joi = require("joi");
const { SNSAnalysesController } = require("./sns-analysis.controller");

const { formatErrorResponse } = require("../interceptor/responseFormatter");
const { CreateSnsAnalysisDto, UpdateSnsAnalysisDto } = require("./dto/sns-analysis.dto");
const { validationFailAction } = require("../shared/validateFailSafeAction");
const snsAnalysisTag = "SNS Analysis";
module.exports = [
  {
    method: "GET",
    path: "/sns-analyses/crop/{cropId}",
    options: {
      tags: ["api", snsAnalysisTag],
      description: "Get SNS Analyses by Crop Id",
      validate: {
        params: Joi.object({
          cropId: Joi.number().integer().required(),
        }),
        failAction: validationFailAction,
      },
    },
    handler: async (request, h) => {
      const controller = new SNSAnalysesController(request, h);
      return controller.getSNSAnalysesByCropId();
    },
  },

  {
    method: "POST",
    path: "/sns-analyses",
    handler: async (request, h) => {
      const controller = new SNSAnalysesController(request, h);
      return controller.createSnsAnalysis();
    },
    options: {
      tags: ["api", snsAnalysisTag],
      description: "Create SNS Analysis",
      validate: {
        payload: CreateSnsAnalysisDto,
        failAction: validationFailAction,
      },
    },
  },
  {
    method: "DELETE",
    path: "/snsAnalysis/{snsAnalysisId}",
    options: {
      tags: ["api", snsAnalysisTag],
      description: "Delete SnsAnalysis by SnsAnalysis Id",
      validate: {
        params: Joi.object({
          snsAnalysisId: Joi.number().integer().required(),
        }),
        failAction: validationFailAction,
      },
    },
    handler: async (request, h) => {
      const controller = new SNSAnalysesController(request, h);
      return controller.deleteSnsAnalysisById();
    },
  },

  {
    method: "PUT",
    path: "/snsAnalysis/{snsAnalysisId}",
    handler: async (request, h) => {
      const controller = new SNSAnalysesController(request, h);
      return controller.updateSnsAnalysis();
    },
    options: {
      tags: ["api", snsAnalysisTag],
      description: "Update SnsAnalysis by Id",
      validate: {
        params: Joi.object({
          snsAnalysisId: Joi.number().integer().required(),
        }),
        payload: UpdateSnsAnalysisDto,
        failAction: validationFailAction,
      },
    },
  },
];
