const Joi = require("joi");
const { formatErrorResponse } = require("../interceptor/responseFormatter");
const { SoilTypeSoilTextureController } = require("./soil-type-soil-texture.controller");

module.exports = [
  {
    method: "GET",
    path: "/soil-type-soil-texture/{soilTypeId}",
    options: {
      tags: ["api", "Soil Type Soil Texture "],
      description: "Get Top Soil Sub Soil ID's by soilTypeId",
      validate: {
        params: Joi.object({
          soilTypeId: Joi.number().required(),
        }),
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
            .code(400)
            .takeover();
        },
      },
    },
    handler: async (request, h) => {
      const controller = new SoilTypeSoilTextureController(request, h);
      return controller.getTopSoilSubSoilBySoilTypeId();
    },
  },
];
