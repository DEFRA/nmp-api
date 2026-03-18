const { formatErrorResponse } = require("../interceptor/responseFormatter");
const { StatusCodeMapper } = require("../constants/http-status-codes-mapper");

const validationFailAction = (request, h, err) => {
  return h
    .response(
      formatErrorResponse({
        source: { error: err },
        request,
      }),
    )
    .code(StatusCodeMapper.BAD_REQUEST)
    .takeover();
};

module.exports = { validationFailAction };
