const Joi = require("joi");
const { RB209MeasurementScotlandController } = require("./measurement-scotland.controller");
const { smnCalculationRequest } = require("./dto/measurement-scotland.dto");
const {
  formatErrorResponse,
} = require("../../../interceptor/responseFormatter");
const { validationFailAction } = require("../../../shared/validateFailSafeAction");

const getController = (request, h) =>
  new RB209MeasurementScotlandController(request, h);

module.exports = [
  {
    method: "POST",
    path: "/vendors/rb209/MeasurementScotland/MeasurementMethod",
    handler: async (request, h) => {
      return getController(request, h).calculateResidueGroup();
    },
    options: {
      tags: ["api", "RB209 MeasurementScotland"],
      description:"The endpoint to calculate residue group using SMN measurement values in Scotland.",
      validate: {
        payload: smnCalculationRequest,
        failAction: validationFailAction
      },
    },
  },
];
