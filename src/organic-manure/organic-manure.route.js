const Joi = require("joi");
const { formatErrorResponse } = require("../interceptor/responseFormatter");
const {
  CreateOrganicManuresWithFarmManureTypeDtoSchema,
} = require("./dto/organic-manure.dto");
const { OrganicManureController } = require("./organic-manure.controller");
const getController = (request, h) => new OrganicManureController(request, h);

// Define routes
module.exports = [
  {
    method: "GET",
    path: "/organic-manures/total-nitrogen/{managementPeriodID}",
    options: {
      tags: ["api", "Organic Manure"],
      description:
        "Get Total Nitrogen by ManagementPeriodID and Application Date Range",
      validate: {
        params: Joi.object({
          managementPeriodID: Joi.number().integer().required(),
        }),
        query: Joi.object({
          fromDate: Joi.date().iso().required(),
          toDate: Joi.date().iso().required(),
          confirm: Joi.boolean().required(),
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
      handler: async (request, h) => {
        return getController(request, h).getTotalNitrogen();
      },
    },
  },
  {
    method: "GET",
    path: "/organic-manures/total-nitrogen-if-green-food-compost/{managementPeriodID}",
    options: {
      tags: ["api", "Organic Manure"],
      description:
        "Get Total Nitrogen by ManagementPeriodID,GreenFoodCompost and Application Date Range",
      validate: {
        params: Joi.object({
          managementPeriodID: Joi.number().integer().required(),
        }),
        query: Joi.object({
          fromDate: Joi.date().iso().required(),
          toDate: Joi.date().iso().required(),
          confirm: Joi.boolean().required(),
          isGreenFoodCompost: Joi.boolean().required(),
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
      handler: async (request, h) => {
        return getController(request, h).getTotalNitrogenIfIsGreenFoodCompost();
      },
    },
  },
  {
    method: "GET",
    path: "/organic-manures/manure-type/{fieldId}",
    options: {
      tags: ["api", "Organic Manure"],
      description: "Get ManureType IDs by FieldId and Harvest Year",
      validate: {
        params: Joi.object({
          fieldId: Joi.number().integer().required(),
        }),
        query: Joi.object({
          year: Joi.number().integer().required(),
          confirm: Joi.boolean().required(),
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
      handler: async (request, h) => {
        return getController(request, h).getManureTypeIdsByFieldAndYear();
      },
    },
  },
  {
    method: "POST",
    path: "/organic-manures",
    options: {
      tags: ["api", "Organic Manure"],
      description: "Create Organic Manures along with Farm Manure Type",
      validate: {
        payload: CreateOrganicManuresWithFarmManureTypeDtoSchema,
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
      handler: async (request, h) => {
        return getController(request, h).createOrganicManures();
      },
    },
  },
  {
    method: "GET",
    path: "/organic-manures/check-existence",
    options: {
      tags: ["api", "Organic Manure"],
      description:
        "Check if liquid manure or ManureTypeID = 8 exists within the date range",
      validate: {
        query: Joi.object({
          managementPeriodID: Joi.number().integer().required(),
          dateFrom: Joi.date().iso().required(),
          dateTo: Joi.date().iso().required(),
          confirm: Joi.boolean(),
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
      handler: async (request, h) => {
        return getController(request, h).checkManureExists();
      },
    },
  },
  {
    method: "DELETE",
    path: "/organic-manures/{organicManureId}",
    options: {
      tags: ["api", "Organic Manure"],
      description: "Delete Organic Manure by OrganicManure Id",
      validate: {
        params: Joi.object({
          organicManureId: Joi.number().integer().required(),
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
      return getController(request, h).deleteOrganicManureById();
    },
  },
  {
    method: "GET",
    path: "/organic-manures/{organicManureID}",
    options: {
      tags: ["api", "Organic Manure"],
      description: "Get organicManure Data By ID",
      validate: {
        params: Joi.object({
          organicManureID: Joi.number().integer().required(),
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
      handler: async (request, h) => {
        return getController(request, h).getOrganicManureDataById();
      },
    },
  },
];
