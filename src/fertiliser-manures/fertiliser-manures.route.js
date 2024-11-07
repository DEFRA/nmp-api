const Joi = require("joi");
const {
  FertiliserManuresController,
} = require("./fertiliser-manures.controller");
const { CreateFertiliserManuresDto } = require("./dto/fertiliser-manures.dto");
const { formatErrorResponse } = require("../interceptor/responseFormatter");

const getController = (request, h) =>
  new FertiliserManuresController(request, h);

module.exports = [
  {
    method: "GET",
    path: "/fertiliser-manures/total-nitrogen/{managementPeriodID}",
    handler: async (request, h) => {
      return getController(request, h).getFertiliserManureNitrogenSum();
    },
    options: {
      tags: ["api", "Fertiliser Manures"],
      description:
        "Get Fertiliser Manure Total Nitrogen by Management Period ID",
      validate: {
        params: Joi.object({
          managementPeriodID: Joi.number().required(),
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
    },
  },

  {
    method: "GET",
    path: "/fertiliser-manures/organic-manures/total-nitrogen/{managementPeriodID}",
    handler: async (request, h) => {
      return getController(request, h).getTotalNitrogen();
    },
    options: {
      tags: ["api", "Fertiliser Manures"],
      description:
        "Get total nitrogen from both Fertiliser and Organic Manures by Management Period ID",
      validate: {
        params: Joi.object({
          managementPeriodID: Joi.number().required(),
        }),
        query: Joi.object({
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
    },
  },

  {
    method: "POST",
    path: "/fertiliser-manures",
    handler: async (request, h) => {
      return getController(request, h).createFertiliserManure();
    },
    options: {
      tags: ["api", "Fertiliser Manures"],
      description: "Create Fertiliser Manures",
      validate: {
        payload: CreateFertiliserManuresDto,
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
