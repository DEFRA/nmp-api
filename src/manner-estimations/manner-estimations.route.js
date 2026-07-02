const {
  MannerEstimationsController,
} = require("./manner-estimations.controller");
const {
  CreateMannerEstimationWithApplicationDto,
  UpdateMannerEstimationWithApplicationsDto,
  CheckMannerEstimationExistsDto,
  CopyMannerEstimationDto,
} = require("./dto/create-manner-estimation.dto");
const { formatErrorResponse } = require("../interceptor/responseFormatter");
const { StatusCodeMapper } = require("../constants/http-status-codes-mapper");
const { validationFailAction } = require("../shared/validateFailSafeAction");
const Joi = require("joi");
const mannerEstimations = "Manner Estimations";
module.exports = [
  {
    method: "POST",
    path: "/manner-estimations",
    handler: async (request, h) => {
      const controller = new MannerEstimationsController(request, h);
      return controller.createMannerEstimation();
    },
    options: {
      tags: ["api", mannerEstimations],
      description: "Create a Manner Estimation",
      validate: {
        payload: CreateMannerEstimationWithApplicationDto,
        failAction: validationFailAction,
      },
    },
  },
  {
    method: "POST",
    path: "/manner-estimations/copyestimates",
    handler: async (request, h) => {
      const controller = new MannerEstimationsController(request, h);
      return controller.copyMannerEstimation();
    },
    options: {
      tags: ["api", mannerEstimations],
      description: "Copy Manner Estimation and related applications",
      validate: {
        payload: CopyMannerEstimationDto,
        failAction: validationFailAction,
      },
    },
  },
  {
    method: "PUT",
    path: "/manner-estimations",
    handler: async (request, h) => {
      const controller = new MannerEstimationsController(request, h);
      return controller.updateMannerEstimationWithApplications();
    },
    options: {
      tags: ["api", mannerEstimations],
      description: "Update Manner Estimation and related applications",
      validate: {
        payload: UpdateMannerEstimationWithApplicationsDto,
        failAction: validationFailAction,
      },
    },
  },
  {
    method: "GET",
    path: "/manner-estimations/{organisationId}",
    options: {
      tags: ["api", mannerEstimations],
      description: "Get Manner Estimations by Organisation ID",
      validate: {
        params: Joi.object({
          organisationId: Joi.string().guid().required(),
        }),
        failAction: validationFailAction,
      },
    },
    handler: async (request, h) => {
      const controller = new MannerEstimationsController(request, h);
      return controller.getByOrganisationId();
    },
  },
  {
    method: "GET",
    path: "/manner-estimations/manner-estimations-by-id/{id}",
    options: {
      tags: ["api", mannerEstimations],
      description: "Get Manner Estimations by ID",
      validate: {
        params: Joi.object({
          id: Joi.number().integer().required(),
        }),
        failAction: validationFailAction,
      },
    },
    handler: async (request, h) => {
      const controller = new MannerEstimationsController(request, h);
      return controller.getById();
    },
  },
  {
    method: "GET",
    path: "/manner-estimations/manner-estimation-related-data/{id}",
    options: {
      tags: ["api", mannerEstimations],
      description: "Get Manner Estimation Related Data by ID",
      validate: {
        params: Joi.object({
          id: Joi.number().integer().required(),
        }),
        failAction: validationFailAction,
      },
    },
    handler: async (request, h) => {
      const controller = new MannerEstimationsController(request, h);
      return controller.getMannerEstimationRelatedDataById();
    },
  },
  {
    method: "GET",
    path: "/manner-estimations/exists",
    options: {
      tags: ["api", mannerEstimations],
      description:
        "Check whether a Manner Estimation exists by organisation id and name",
      validate: {
        query: CheckMannerEstimationExistsDto,
        failAction: validationFailAction,
      },
    },
    handler: async (request, h) => {
      const controller = new MannerEstimationsController(request, h);
      return controller.checkMannerEstimationExists();
    },
  },
];
