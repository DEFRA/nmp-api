// response.interceptor.js
"use strict";

const {
  formatSuccessResponse,
  formatErrorResponse,
} = require("./responseFormatter");

const responseHandlerPlugin = {
  name: "response-handler",
  version: "1.0.0",
  register: async function (server, _) {
    server.ext("onPostHandler", (request, h) => {
      const excludedPaths = ["/docs", "/swagger.json", "/swaggerui"];

      // Skip interceptor for excluded paths
      if (excludedPaths.some((path) => request.path.startsWith(path))) {
        return h.continue;
      }
      const response = request.response;

      // If the response is an error
      if (
        response &&
        (response?.source?.error || response?.source?.Errors?.length ||
          (response?.source?.status && response?.source?.status !== 200))
      ) {
        const payload = formatErrorResponse(response);
        return h.response(payload).code(payload.statusCode);
      }
      // If the response is a successful one (not an error)
      else if (response && !response?.source?.error) {
        const payload = formatSuccessResponse(response);
        return h.response(payload).code(payload.statusCode);
      }

      return h.continue;
    });
  },
};

module.exports = responseHandlerPlugin;
