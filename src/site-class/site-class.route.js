const Joi = require("joi");
const { SiteClassController } = require("./site-class.controller");
const { validationFailAction } = require("../shared/validateFailSafeAction");

const getController = (request, h) => new SiteClassController(request, h);

module.exports = [
  {
    method: "POST",
    path: "/site-class/byFieldIds",
    handler: async (request, h) => {
      return getController(request, h).getSiteClassId();
    },
    options: {
      tags: ["api", "Site Class"],
      description: "Get Site Class ID by Field IDs",
      validate: {
        payload: Joi.object({
          fieldIds: Joi.array()
            .items(Joi.number().integer().required())
            .min(1)
            .required()
            .description("Array of field IDs, e.g., [1, 2, 3]"),
        }),
        failAction: validationFailAction,
      },
    },
  },
];
