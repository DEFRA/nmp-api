const Joi = require("joi");
const { ScotlandNMaxValueController } = require("./scotland-nmax-values.controller");
const { formatErrorResponse } = require("../interceptor/responseFormatter");
const BAD_REQUEST=400;
module.exports = [
  {
    method: "GET",
    path: "/scotland-nmax-values/getAll",
    handler: async (request, h) => {
      const controller = new ScotlandNMaxValueController(request, h);
      return controller.getAll();
    },
    options: {
      tags: ["api", "Scotland nmax values"],
      description: "Get all scotland nmax value",
      validate: {        
        failAction: (request, h, err) => {
          return h
            .response(
              formatErrorResponse({
                source: {
                  error: err,
                },
                request,
              })
            )
            .code(BAD_REQUEST)
            .takeover();
        },
      },
    },
  },
  ];