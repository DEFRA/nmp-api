const Joi = require("joi");
const {
  SecondCropLinkingsController,
} = require("./second-crop-linkings.controller");
const { formatErrorResponse } = require("../interceptor/responseFormatter");

module.exports = [
  {
    method: "GET",
    path: "/second-crop-linkings/{firstCropID}",
    handler: async (request, h) => {
      const controller = new SecondCropLinkingsController(request, h);
      return controller.getSecondCropTypeLinkingByFirstCropId();
    },
    options: {
      tags: ["api", "SecondCropLinkings"],
      description: "Get Second Crop Type Linking by First Crop ID",
      notes: "Returns the SecondCropID for the given FirstCropID",
      validate: {
        params: Joi.object({
          firstCropID: Joi.number()
            .integer()
            .required()
            .description("First Crop ID")
            .messages({
              "number.base": "FirstCropID must be a number",
              "any.required": "FirstCropID is required",
            }),
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
