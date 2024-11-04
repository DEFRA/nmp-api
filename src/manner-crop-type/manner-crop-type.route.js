const Joi = require("joi");
const { MannerCropTypeController } = require("./manner-crop-type.controller");
const { formatErrorResponse } = require("../interceptor/responseFormatter");

module.exports = [
  {
    method: "GET",
    path: "/manner-crop-types/{cropTypeID}",
    handler: async (request, h) => {
      const controller = new MannerCropTypeController(request, h);
      return controller.getMannerCropTypesByCropTypeID();
    },
    options: {
      tags: ["api", "Manner Crop Types"],
      description: "Get MannerCropTypeId and cropUptakeFactor by CropTypeId",
      validate: {
        params: Joi.object({
          cropTypeID: Joi.number().integer().required(),
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
  },
];
