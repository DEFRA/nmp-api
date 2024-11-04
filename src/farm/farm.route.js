const Joi = require("joi");
const { FarmController } = require("./farm.controller");
const { FarmPayloadDto, FarmUpdatePayloadDto } = require("./dto/farm.dto");
const { formatErrorResponse } = require("../interceptor/responseFormatter");

const getController = (request, h) => new FarmController(request, h);

module.exports = [
  {
    method: "GET",
    path: "/farms/exists",
    options: {
      tags: ["api", "Farm"],
      description: "Check if Farm exists using Name and Postcode",
      validate: {
        query: Joi.object({
          Name: Joi.string().required(),
          Postcode: Joi.string().required(),
          Id: Joi.number().optional(),
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
      return getController(request, h).checkFarmExists();
    },
  },
  {
    method: "GET",
    path: "/farms",
    options: {
      tags: ["api", "Farm"],
      description: "Get all farms",
    },
    handler: async (request, h) => {
      return getController(request, h).getAll();
    },
  },
  {
    method: "GET",
    path: "/farms/{farmId}",
    options: {
      tags: ["api", "Farm"],
      description: "Get Farm by id",
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
              })
            )
            .code(400)
            .takeover();
        },
      },
    },
    handler: async (request, h) => {
      return getController(request, h).getById();
    },
  },
  {
    method: "DELETE",
    path: "/farms/{farmId}",
    options: {
      tags: ["api", "Farm"],
      description: "Delete Farm by Farm Id",
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
              })
            )
            .code(400)
            .takeover();
        },
      },
    },
    handler: async (request, h) => {
      return getController(request, h).deleteFarmById();
    },
  },
  {
    method: "POST",
    path: "/farms/createFarm",
    handler: async (request, h) => {
      return getController(request, h).createFarm();
    },
    options: {
      tags: ["api", "Farm"],
      description: "Create Farm API",
      validate: {
        payload: FarmPayloadDto,
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
    method: "PUT",
    path: "/farms/updateFarm",
    handler: async (request, h) => {
      return getController(request, h).updateFarm();
    },
    options: {
      tags: ["api", "Farm"],
      description: "Update Farm api",
      validate: {
        payload: FarmUpdatePayloadDto,
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
    path: "/farms/organisations/{organisationId}",
    handler: async (request, h) => {
      return getController(request, h).getFarmsByOrganisationId();
    },
    options: {
      tags: ["api", "Farm"],
      description: "Get Farms by Organisation Id",
      validate: {
        params: Joi.object({
          organisationId: Joi.string().required(),
        }),
        query: Joi.object({
          shortSummary: Joi.boolean().optional(),
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
