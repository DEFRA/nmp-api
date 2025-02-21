// responseFormatter.js

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

const formatErrorResponse =  (errorResponse) => {
  const error = errorResponse?.source?.error || errorResponse;
  return {
    message: "fail",
    status: false,
    data: errorResponse?.source?.data || null,
    statusCode:
      error?.output?.statusCode || errorResponse?.source?.status || 500,
    timestamp: new Date().toISOString(),
    error: {
      message:
        errorResponse?.source?.Errors ||
        errorResponse?.source?.data?.errorMessage ||
        errorResponse?.source?.data?.message ||
        errorResponse?.source?.data?.Invalid ||
        errorResponse?.source?.data?.error ||
        error?.message ||
        "An error occurred",
      stack: process.env.NODE_ENV === "production" ? null : error?.stack,
      path: errorResponse?.request?.path || null,
    },
  };
};

module.exports = {
  formatSuccessResponse,
  formatErrorResponse,
};
