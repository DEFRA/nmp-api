const {
  MannerEstimationsController,
} = require("./manner-estimations.controller");
const {
  CreateMannerEstimationWithApplicationDto,
  CheckMannerEstimationExistsDto,
} = require("./dto/create-manner-estimation.dto");
const { formatErrorResponse } = require("../interceptor/responseFormatter");
const { StatusCodeMapper } = require("../constants/http-status-codes-mapper");

module.exports = [
  {
    method: "POST",
    path: "/manner-estimations",
    handler: async (request, h) => {
      const controller = new MannerEstimationsController(request, h);
      return controller.createMannerEstimation();
    },
    options: {
      tags: ["api", "Manner Estimations"],
      description: "Create a Manner Estimation",
      validate: {
        payload: CreateMannerEstimationWithApplicationDto,
        failAction: (request, h, err) => {
          return h
            .response(
              formatErrorResponse({
                source: { error: err },
                request,
              }),
            )
            .code(StatusCodeMapper.BAD_REQUEST)
            .takeover();
        },
      },
    },
  },
  {
    method: "GET",
    path: "/manner-estimations",
    options: {
      tags: ["api", "Manner Estimations"],
      description: "Get all Manner Estimations",
    },
    handler: async (request, h) => {
      const controller = new MannerEstimationsController(request, h);
      return controller.getAll();
    },
  },
  {
    method: "GET",
    path: "/manner-estimations/exists",
    options: {
      tags: ["api", "Manner Estimations"],
      description:
        "Check whether a Manner Estimation exists by organisation id and name",
      validate: {
        query: CheckMannerEstimationExistsDto,
        failAction: (request, h, err) => {
          return h
            .response(
              formatErrorResponse({
                source: { error: err },
                request,
              }),
            )
            .code(StatusCodeMapper.BAD_REQUEST)
            .takeover();
        },
      },
    },
    handler: async (request, h) => {
      const controller = new MannerEstimationsController(request, h);
      return controller.checkMannerEstimationExists();
    },
  },
];
