const {
  MannerEstimationsController,
} = require("./manner-estimations.controller");
const {
  CreateMannerEstimationWithApplicationDto
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
];
