const Joi = require("joi");
const { SNSAnalysesController } = require("./sns-analysis.controller");

const { formatErrorResponse } = require("../interceptor/responseFormatter");
const { CreateSnsAnalysisDto, UpdateSnsAnalysisDto } = require("./dto/sns-analysis.dto");

module.exports = [
  {
    method: "GET",
    path: "/sns-analyses/crop/{cropId}",
    options: {
      tags: ["api", "SNS Analysis"],
      description: "Get SNS Analyses by Crop Id",
      validate: {
        params: Joi.object({
          cropId: Joi.number().integer().required(),
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
      tags: ["api", "SNS Analysis"],
      description: "Create SNS Analysis",
      validate: {
        payload: CreateSnsAnalysisDto,
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
    method: "DELETE",
    path: "/snsAnalysis/{snsAnalysisId}",
    options: {
      tags: ["api", "SNS Analysis"],
      description: "Delete SnsAnalysis by SnsAnalysis Id",
      validate: {
        params: Joi.object({
          snsAnalysisId: Joi.number().integer().required(),
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
      tags: ["api", "SNS Analysis"],
      description: "Update SnsAnalysis by Id",
      validate: {
        params: Joi.object({
          snsAnalysisId: Joi.number().integer().required(),
        }),
        payload: UpdateSnsAnalysisDto,
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
