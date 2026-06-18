const {
  MannerEstimationsController,
} = require("./manner-estimations.controller");
const {
  CreateMannerEstimationWithApplicationDto,
  CheckMannerEstimationExistsDto,
} = require("./dto/create-manner-estimation.dto");
const { formatErrorResponse } = require("../interceptor/responseFormatter");
const { StatusCodeMapper } = require("../constants/http-status-codes-mapper");
const { validationFailAction } = require("../shared/validateFailSafeAction");
const Joi = require("joi");
const mannerEstimations = "Manner Estimations"
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
    method: "GET",
    path: "/manner-estimations/{organisationId}",
    options: {
      tags: ["api", mannerEstimations],
      description: "Get Manner Estimations by Organisation ID",
      validate: {
        params: Joi.object({
          organisationId: Joi.number().integer().required(),
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
