const Joi = require("joi");
const {
  MannerEstimationApplicationsController,
} = require("./manner-estimation-applications.controller");

const { formatErrorResponse } = require("../interceptor/responseFormatter");
const { StatusCodeMapper } = require("../constants/http-status-codes-mapper");
const {
  CreateMannerEstimationApplicationDto,
  UpdateMannerEstimationApplicationDto,
} = require("./dto/manner-estimation-applications.dto");
const { validationFailAction } = require("../shared/validateFailSafeAction");
const mannerEstimationApplicationsTag = "Manner Estimation Applications";
module.exports = [
  {
    method: "POST",
    path: "/manner-estimation-applications",
    handler: async (request, h) => {
      const controller = new MannerEstimationApplicationsController(request, h);
      return controller.createMannerEstimationApplication();
    },
    options: {
      tags: ["api", "mannerEstimationApplicationsTag"],
      description: "Create Manner Estimation Application",
      validate: {
        payload: CreateMannerEstimationApplicationDto,
        failAction: validationFailAction,
      },
    },
  },
  {
    method: "GET",
    path: "/manner-estimation-applications/{mannerEstimationId}",
    options: {
      tags: ["api", mannerEstimationApplicationsTag],
      description: "Get Manner Estimation Applications by MannerEstimationID",
      validate: {
        params: Joi.object({
          mannerEstimationId: Joi.number().required(),
        }),
        failAction: validationFailAction,
      },
    },
    handler: async (request, h) => {
      const controller = new MannerEstimationApplicationsController(request, h);
      return controller.getEstimationApplicationsByEstimationId();
    },
  },
  {
    method: "PUT",
    path: "/manner-estimation-applications/{id}",
    handler: async (request, h) => {
      const controller = new MannerEstimationApplicationsController(request, h);
      return controller.updateMannerEstimationApplication();
    },
    options: {
      tags: ["api", mannerEstimationApplicationsTag],
      description: "Update Manner Estimation Application",
      validate: {
        params: Joi.object({
          id: Joi.number().integer().required(),
        }),
        payload: UpdateMannerEstimationApplicationDto,
        failAction: validationFailAction,
      },
    },
  },
  {
    method: "GET",
    path: "/manner-estimation-applications/manner-estimations-applications-by-id/{id}",
    options: {
      tags: ["api", mannerEstimationApplicationsTag],
      description: "Get Manner Estimations Applications by ID",
      validate: {
        params: Joi.object({
          id: Joi.number().integer().required(),
        }),
        failAction: validationFailAction,
      },
    },
    handler: async (request, h) => {
      const controller = new MannerEstimationApplicationsController(request, h);
      return controller.getById();
    },
  },
  {
    method: "GET",
    path: "/manner-estimation-applications/total-n/{mannerEstimationId}",
    options: {
      tags: ["api", mannerEstimationApplicationsTag],
      description:
        "Get Total N by Manner Estimation ID and application date range",
      validate: {
        params: Joi.object({
          mannerEstimationId: Joi.number().integer().required(),
        }),
        query: Joi.object({
          startDate: Joi.date().iso().required(),
          endDate: Joi.date().iso().required(),
          mannerApplicationId: Joi.number().integer().allow(null).optional(),
        }),
        failAction: validationFailAction,
      },
    },
    handler: async (request, h) => {
      const controller = new MannerEstimationApplicationsController(request, h);
      return controller.fetchTotalNByMannerEstimationIdAppDate();
    },
  },
  {
    method: "GET",
    path: "/manner-estimation-applications/total-n-if-green-food-compost/{mannerEstimationId}",
    options: {
      tags: ["api", mannerEstimationApplicationsTag],
      description:
        "Get Total N by Manner Estimation ID, date range and green food compost flag",
      validate: {
        params: Joi.object({
          mannerEstimationId: Joi.number().integer().required(),
        }),
        query: Joi.object({
          startDate: Joi.date().iso().required(),
          endDate: Joi.date().iso().required(),
          isGreenFoodCompost: Joi.boolean().required(),
          mannerApplicationId: Joi.number().integer().allow(null).optional(),
        }),
        failAction: validationFailAction,
      },
    },
    handler: async (request, h) => {
      const controller = new MannerEstimationApplicationsController(request, h);
      return controller.fetchTotalNBasedByMannerEstimationIdAppDateAndIsGreenCompost();
    },
  },
  {
    method: "GET",
    path: "/manner-estimation-applications/check-green-compost/{mannerEstimationId}",
    options: {
      tags: ["api", mannerEstimationApplicationsTag],
      description:
        "Check if green compost exists by Manner Estimation ID and application date range",
      validate: {
        params: Joi.object({
          mannerEstimationId: Joi.number().integer().required(),
        }),
        query: Joi.object({
          dateFrom: Joi.date().iso().required(),
          dateTo: Joi.date().iso().required(),
          mannerApplicationId: Joi.number().integer().allow(null).optional(),
        }),
        failAction: validationFailAction,
      },
    },
    handler: async (request, h) => {
      const controller = new MannerEstimationApplicationsController(request, h);
      return controller.checkMannerGreenCompostExistanceByDateRange();
    },
  },
];
