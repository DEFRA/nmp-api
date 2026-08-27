// responseFormatter.js

const { StatusCodeMapper } = require("../constants/http-status-codes-mapper");

const formatSuccessResponse = (response) => {
  const data = response?.source;
  return {
    message: "success",
    status: true,
    data: data.data ? data.data:data,
    statusCode: response?.statusCode,
    timestamp: new Date().toISOString(),
    error: null,
  };
};

const formatErrorResponse = (errorResponse) => {
  const error = errorResponse?.source?.error || errorResponse;

  const errorMessage =
    [
      errorResponse?.source?.Errors,
      errorResponse?.source?.data?.errorMessage,
      errorResponse?.source?.data?.message,
      errorResponse?.source?.data?.Invalid,
      errorResponse?.source?.data?.error,
      error?.message,
    ].find(Boolean) || "An error occurred";

  return {
    message: "fail",
    status: false,
    data: errorResponse?.source?.data || null,
    statusCode:
      error?.output?.statusCode ||
      errorResponse?.source?.status ||
      StatusCodeMapper.INTERNAL_SERVER_ERROR,
    timestamp: new Date().toISOString(),
    error: {
      message: errorMessage,
      stack: process.env.NODE_ENV === "production" ? null : error?.stack,
      path: errorResponse?.request?.path || null,
    },
  };
};

module.exports = {
  formatSuccessResponse,
  formatErrorResponse,
};
