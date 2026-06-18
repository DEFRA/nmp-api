const {
  MannerFinancialValuesController,
} = require("./manner-financial-values.controller");

const { formatErrorResponse } = require("../interceptor/responseFormatter");
const { StatusCodeMapper } = require("../constants/http-status-codes-mapper");
const {
  CreateMannerFinancialValuesDto,
} = require("./dto/manner-financial-values.dto");

module.exports = [
  {
    method: "POST",
    path: "/manner-financial-values",
    handler: async (request, h) => {
      const controller = new MannerFinancialValuesController(request, h);
      return controller.createMannerFinancialValues();
    },
    options: {
      tags: ["api", "Manner Financial Values"],
      description: "Create Manner Financial Values",
      validate: {
        payload: CreateMannerFinancialValuesDto,
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
];
