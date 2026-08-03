const { appendYearlyLog } = require("../../shared/yearly-log-service");
const {
  StatusCodeMapper,
} = require("../../constants/http-status-codes-mapper");

const MAX_LOG_STRING_LENGTH = 4000;

const truncateString = (value) => {
  if (value.length <= MAX_LOG_STRING_LENGTH) {
    return value;
  }

  return `${value.slice(0, MAX_LOG_STRING_LENGTH)}...[truncated]`;
};

const summarizePayload = (payload) => {
  if (payload === null || payload === undefined) {
    return null;
  }

  if (typeof payload === "string") {
    return truncateString(payload);
  }

  if (Array.isArray(payload)) {
    return {
      type: "array",
      length: payload.length,
    };
  }

  if (typeof payload === "object") {
    const keys = Object.keys(payload);
    return {
      type: "object",
      keyCount: keys.length,
      keys: keys.slice(0, 40),
    };
  }

  return payload;
};

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
        body: summarizePayload(requestPayload),
      },
      response: summarizePayload(
        error?.response?.data ?? error?.message ?? null,
      ),
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
