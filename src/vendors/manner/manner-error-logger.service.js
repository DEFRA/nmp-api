const { StatusCodeMapper } = require("../../constants/http-status-codes-mapper");
const { appendYearlyLog } = require("../../shared/yearly-log-service");

const logMannerApiError = ({
  method,
  endpoint,
  requestPayload,
  error,
  startedAt,
}) => {
  appendYearlyLog({
    filePrefix: "vendor-api-log",
    logType: "error",
    source: "vendor-manner",
    message: "Manner API call failed",
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
      statusCode: error?.response?.status ?? StatusCodeMapper.INTERNAL_SERVER_ERROR,
      durationMs: Date.now() - startedAt,
    },
  });
};

module.exports = { logMannerApiError };
