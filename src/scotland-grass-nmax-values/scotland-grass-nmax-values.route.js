const Joi = require("joi");
const {
  ScotlandGrassNMaxValueController,
} = require("./scotland-grass-nmax-values.controller");
const { formatErrorResponse } = require("../interceptor/responseFormatter");

const BAD_REQUEST = 400;
const MIN_SITE_CLASS = 1;
const MAX_SITE_CLASS = 5;

const failAction = (request, h, err) => {
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
};

module.exports = [
  {
    method: "GET",
    path: "/scotland-grass-nmax-values/getAll",
    handler: async (request, h) => {
      const controller = new ScotlandGrassNMaxValueController(request, h);
      return controller.getAll();
    },
    options: {
      tags: ["api", "Scotland grass nmax values"],
      description: "Get all Scotland grass nmax values",
      validate: {
        failAction,
      },
    },
  },
  {
    method: "GET",
    path: "/scotland-grass-nmax-values",
    handler: async (request, h) => {
      const controller = new ScotlandGrassNMaxValueController(request, h);
      return controller.getNMaxValue();
    },
    options: {
      tags: ["api", "Scotland grass nmax values"],
      description:
        "Get Scotland grass nmax value by SwardTypeID, SwardManagementID, DefoliationSequenceID and SiteClass",
      validate: {
        query: Joi.object({
          swardTypeID: Joi.number().integer().required(),
          swardManagementID: Joi.number().integer().required(),
          defoliationSequenceID: Joi.number().integer().required(),
          siteClass: Joi.number()
            .integer()
            .min(MIN_SITE_CLASS)
            .max(MAX_SITE_CLASS)
            .required(),
        }),
        failAction,
      },
    },
  },
];
