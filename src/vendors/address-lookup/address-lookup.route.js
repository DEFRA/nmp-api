const Joi = require("joi");
const { AddressLookupController } = require("./address-lookup.controller");
const { formatErrorResponse } = require("../../interceptor/responseFormatter");
const { validationFailAction } = require("../../shared/validateFailSafeAction");
const getController = (request, h) => new AddressLookupController(request, h);

module.exports = [
  {
    method: "GET",
    path: "/vendors/address-lookup",
    options: {
      tags: ["api", "Address Lookup"],
      description: "Health check endpoint for Address Lookup service",
    },
    handler: async (request, h) => {
      return getController(request, h).health();
    },
  },
  {
    method: "GET",
    path: "/vendors/address-lookup/addresses",
    options: {
      tags: ["api", "Address Lookup"],
      description: "Get Addresses by Postcode",
      validate: {
        query: Joi.object({
          postcode: Joi.string().required().description("Postcode to look up"),
          offset: Joi.number()
            .integer()
            .min(0)
            .default(0)
            .description("Offset for pagination"),
        }),
        failAction: validationFailAction
      },
    },
    handler: async (request, h) => {
      return getController(request, h).getAddresses();
    },
  },
];
