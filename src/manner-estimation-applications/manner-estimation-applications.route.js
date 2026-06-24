const Joi = require("joi");
const {
  MannerEstimationApplicationsController,
} = require("./manner-estimation-applications.controller");

const { formatErrorResponse } = require("../interceptor/responseFormatter");
const { StatusCodeMapper } = require("../constants/http-status-codes-mapper");
const { CreateMannerEstimationApplicationDto } = require("./dto/manner-estimation-applications.dto");
const { validationFailAction } = require("../shared/validateFailSafeAction");

module.exports = [
  {
    method: "POST",
    path: "/manner-estimation-applications",
    handler: async (request, h) => {
      const controller = new MannerEstimationApplicationsController(request, h);
      return controller.createMannerEstimationApplication();
    },
    options: {
      tags: ["api", "Manner Estimation Applications"],
      description: "Create Manner Estimation Application",
      validate: {
        payload: CreateMannerEstimationApplicationDto,
        failAction: validationFailAction
      },
    },
  },
  {
    method: "GET",
    path: "/manner-estimation-applications/{mannerEstimationId}",
    options: {
      tags: ["api", "Manner Estimation Applications"],
      description: "Get Manner Estimation Applications by MannerEstimationID",
      validate: {
              params: Joi.object({
                mannerEstimationId: Joi.number().required(),
              }),
              failAction: validationFailAction
            },
    },
    handler: async (request, h) => {
      const controller = new MannerEstimationApplicationsController(request, h);
      return controller.getEstimationApplicationsByEstimationId();
    },
  },
];
