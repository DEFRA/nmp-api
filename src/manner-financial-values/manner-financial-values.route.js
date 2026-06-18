const {
  MannerFinancialValuesController,
} = require("./manner-financial-values.controller");

const { formatErrorResponse } = require("../interceptor/responseFormatter");
const { StatusCodeMapper } = require("../constants/http-status-codes-mapper");
const {
  CreateMannerFinancialValuesDto,
} = require("./dto/manner-financial-values.dto");
const { validationFailAction } = require("../shared/validateFailSafeAction");

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
        failAction: validationFailAction
      },
    },
  },
];
