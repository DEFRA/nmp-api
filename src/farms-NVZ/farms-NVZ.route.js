const Joi = require("joi");
const { formatErrorResponse } = require("../interceptor/responseFormatter");
const { FarmsNVZController } = require("./farms-NVZ.controller");
const {
  FarmsNVZEntitySchema,
} = require("./dto/farms-NVZ.dto");

const BAD_REQUEST=400;

module.exports = [
  {
    method: "GET",
    path: "/farmsNVZ/{farmId}",
    options: {
      tags: ["api", "FarmsNVZ"],
      description: "Get FarmsNVZ by Farm Id",
      validate: {
        params: Joi.object({
          farmId: Joi.number().integer().required(),
        }),
        failAction: (request, h, err) => {
          return h
            .response(
              formatErrorResponse({
                source: {
                  error: err,
                },
                request,
              }),
            )
            .code(BAD_REQUEST)
            .takeover();
        },
      },
    },
    handler: async (request, h) => {
      const controller = new FarmsNVZController(request, h);
      return controller.getByFarmId();
    },
  },
]