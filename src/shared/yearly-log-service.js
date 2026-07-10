const fs = require("node:fs");
const path = require("node:path");
const { StatusCodeMapper } = require("../constants/http-status-codes-mapper");

const getDefaultLogDir = () => {
  const mainFile = require.main?.filename || "";
  const isBuiltRuntime = mainFile.includes(`${path.sep}dist${path.sep}`);

  if (isBuiltRuntime) {
    return path.resolve(process.cwd(), "dist", "logs");
  }

  return path.resolve(process.cwd(), "logs");
};

const DEFAULT_LOG_DIR = getDefaultLogDir();
const LOG_JSON_INDENT = 2;

const safeJsonStringify = (value, space = 0) => {
  try {
    return JSON.stringify(value, null, space);
  } catch (error) {
    return JSON.stringify(
      {
        stringifyError: error?.message || "Unable to stringify payload",
      },
      null,
      space,
    );
  }
};

const writeYearlyLog = (_filePrefix, logType, payload = null, context = {}) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const logFilePath = path.join(DEFAULT_LOG_DIR, `${year}.log`);

    fs.mkdirSync(DEFAULT_LOG_DIR, { recursive: true });

    const isErrorLog = (logType || "success") === "error";
    const errorDetails = payload?.response;
    const normalizedErrorBody =
      errorDetails && typeof errorDetails === "object"
        ? { ...errorDetails }
        : { message: errorDetails ?? null };

    const entry = {
      timestamp: now.toISOString(),
      level: logType || "success",
      service: context?.service || null,
      payload: payload?.request ?? null,
      error: isErrorLog
        ? {
            ...normalizedErrorBody,
            stack: payload?.stack ?? null,
          }
        : null,
    };

    fs.appendFileSync(
      logFilePath,
      `${safeJsonStringify(entry, LOG_JSON_INDENT)}\n`,
      "utf8",
    );
  } catch (loggingError) {
    console.error("Failed to write yearly log:", loggingError);
  }
};

const buildStructuredApiPayload = (entry) => {
  const defaultPayload = { request: null, response: null, stack: null };

  if (entry instanceof Error) {
    return {
      ...defaultPayload,
      response: entry.message || "Unknown error",
      stack: entry.stack || "N/A",
    };
  }

  if (!entry || typeof entry !== "object") {
    return {
      ...defaultPayload,
      response: entry,
    };
  }

  return {
    request: entry.request ?? null,
    response: entry.response ?? entry.data ?? null,
    stack: entry.stack ?? null,
  };
};

const getLogTypeFromEntry = (entry) => {
  if (entry instanceof Error) {
    return "error";
  }

  if (
    entry &&
    typeof entry === "object" &&
    Number(entry.status) >= StatusCodeMapper.BAD_REQUEST
  ) {
    return "error";
  }

  if (entry && typeof entry === "object" && entry.error) {
    return "error";
  }

  return "success";
};

const logRecordLogs = (entry, options = {}) => {
  writeYearlyLog(
    "record-api-logs",
    getLogTypeFromEntry(entry),
    buildStructuredApiPayload(entry),
    { service: options.service || null },
  );
};

const appendYearlyLog = ({
  filePrefix = "application-log",
  logType = "info",
  source = "unknown",
  message = "",
  payload = null,
  context = {},
  logDir = DEFAULT_LOG_DIR,
}) => {
  const mergedContext = {
    source,
    message,
    ...context,
  };

  if (logDir !== DEFAULT_LOG_DIR) {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const timestamp = now.toISOString();
      const logFilePath = path.join(logDir, `${year}.log`);

      fs.mkdirSync(logDir, { recursive: true });

      const logEntry = [
        `timestamp=${timestamp}`,
        `type=${logType}`,
        `payload=${safeJsonStringify(payload)}`,
        `context=${safeJsonStringify(mergedContext)}`,
        "---",
      ].join("\n");

      fs.appendFileSync(logFilePath, `${logEntry}\n`, "utf8");
    } catch (loggingError) {
      console.error("Failed to write yearly log:", loggingError);
    }
    return;
  }

  writeYearlyLog(filePrefix, logType, payload, mergedContext);
};

const logApiResponse = ({
  source,
  endpoint,
  payload,
  context = {},
  filePrefix = "api-log",
  message = "API response received",
}) => {
  appendYearlyLog({
    filePrefix,
    logType: "response",
    source,
    message,
    payload,
    context: {
      endpoint,
      ...context,
    },
  });
};

const logApiError = ({
  source,
  endpoint,
  error,
  context = {},
  filePrefix = "api-log",
  message = "API call failed",
}) => {
  appendYearlyLog({
    filePrefix,
    logType: "error",
    source,
    message,
    payload: {
      message: error?.message || "Unknown error",
      stack: error?.stack || "N/A",
    },
    context: {
      endpoint,
      ...context,
    },
  });
};

const createApiLogger = ({
  filePrefix = "api-log",
  source = "unknown",
  endpoint = "",
  responseMessage = "API response received",
  errorMessage = "API call failed",
} = {}) => ({
  response: (payload, context = {}) => {
    logApiResponse({
      filePrefix,
      source,
      endpoint,
      message: responseMessage,
      payload,
      context,
    });
  },
  error: (error, context = {}) => {
    logApiError({
      filePrefix,
      source,
      endpoint,
      message: errorMessage,
      error,
      context,
    });
  },
});

module.exports = {
  logRecordLogs,
  writeYearlyLog,
  appendYearlyLog,
  logApiResponse,
  logApiError,
  createApiLogger,
};
