const { appendYearlyLog } = require("../../shared/yearly-log-service");
const {
  StatusCodeMapper,
} = require("../../constants/http-status-codes-mapper");

const logRb209ApiError = ({
  method,
  endpoint,
  requestPayload,
  error,
  startedAt,
}) => {
  appendYearlyLog({
    filePrefix: "vendor-api-log",
    logType: "error",
    source: "vendor-rb209",
    message: "RB209 API call failed",
    payload: {
      request: {
        method,
        endpoint,
        body: requestPayload ?? null,
      },
      response: error?.response?.data ?? error?.message ?? null,
      stack: error?.stack || null,
    },
    context: {
      endpoint,
      method,
      statusCode:
        error?.response?.status ?? StatusCodeMapper.INTERNAL_SERVER_ERROR,
      durationMs: Date.now() - startedAt,
    },
  });
};

module.exports = { logRb209ApiError };
