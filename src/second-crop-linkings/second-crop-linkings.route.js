const Joi = require("joi");
const {
  SecondCropLinkingsController,
} = require("./second-crop-linkings.controller");
const { formatErrorResponse } = require("../interceptor/responseFormatter");
const { validationFailAction } = require("../shared/validateFailSafeAction");

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
        query: Joi.object({
          rB209CountryID: Joi.number().required(),
        }),
        failAction: validationFailAction
      },
    },
  },
];
