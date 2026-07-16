const { StatusCodeMapper } = require("../constants/http-status-codes-mapper");
const { appendYearlyLog } = require("./yearly-log-service");

const toErrorResponse = (error) => ({
  message:
    error?.message ||
    error?.output?.payload?.message ||
    error?.error ||
    "Unknown error",
  statusCode: error?.output?.statusCode || error?.statusCode || StatusCodeMapper.INTERNAL_SERVER_ERROR,
});

const isErrorLike = (value) => {
  if (!value || typeof value !== "object") {
    return false;
  }

  if (value instanceof Error || value.isBoom) {
    return true;
  }

  if (value.stack && (value.message || value.name)) {
    return true;
  }

  return Number(value.statusCode) >= StatusCodeMapper.BAD_REQUEST || Boolean(value.error);
};

const getErrorFromHandlerResult = (result) => {
  const source = result?.source ?? result;

  if (!source) {
    return null;
  }

  if (isErrorLike(source)) {
    return source;
  }

  if (source && typeof source === "object" && isErrorLike(source.error)) {
    return source.error;
  }

  return null;
};

const getStatusCodeFromHandlerResult = (result, fallbackError = null) => {
  return (
    result?.statusCode ||
    fallbackError?.output?.statusCode ||
    fallbackError?.statusCode ||
    StatusCodeMapper.INTERNAL_SERVER_ERROR
  );
};

const buildRequestLogPayload = (request) => ({
  method: request?.method?.toUpperCase() || null,
  path: request?.path || null,
  params: request?.params || null,
  query: request?.query || null,
});

const wrapRouteWithLogging = (route) => {
  if (!route) {
    return route;
  }

  const directHandler =
    typeof route.handler === "function" ? route.handler : null;
  const optionsHandler =
    typeof route.options?.handler === "function" ? route.options.handler : null;
  const originalHandler = directHandler || optionsHandler;

  if (!originalHandler) {
    return route;
  }

  const wrappedHandler = async (request, h) => {
    const startedAt = Date.now();
    const requestPayload = buildRequestLogPayload(request);

    try {
      const result = await originalHandler(request, h);
      const handledError = getErrorFromHandlerResult(result);

      if (handledError) {
        appendYearlyLog({
          filePrefix: "endpoint-log",
          logType: "error",
          source: "controller-handler",
          message: "Endpoint returned error response",
          payload: {
            request: requestPayload,
            response: toErrorResponse(handledError),
            stack: handledError?.stack || null,
          },
          context: {
            endpoint: `${requestPayload.method} ${requestPayload.path}`,
            statusCode: getStatusCodeFromHandlerResult(result, handledError),
            durationMs: Date.now() - startedAt,
          },
        });
      }

      return result;
    } catch (error) {
      appendYearlyLog({
        filePrefix: "endpoint-log",
        logType: "error",
        source: "controller-handler",
        message: "Endpoint handler failed",
        payload: {
          request: requestPayload,
          response: toErrorResponse(error),
          stack: error?.stack || null,
        },
        context: {
          endpoint: `${requestPayload.method} ${requestPayload.path}`,
          statusCode: error?.output?.statusCode || error?.statusCode || StatusCodeMapper.INTERNAL_SERVER_ERROR,
          durationMs: Date.now() - startedAt,
        },
      });

      throw error;
    }
  };

  if (directHandler) {
    return {
      ...route,
      handler: wrappedHandler,
    };
  }

  return {
    ...route,
    options: {
      ...route.options,
      handler: wrappedHandler,
    },
  };
};

module.exports = {
  wrapRouteWithLogging,
};
