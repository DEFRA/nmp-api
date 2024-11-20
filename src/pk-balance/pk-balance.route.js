const Joi = require("joi");
const { PKBalanceController } = require("./pk-balance.controller");
const { CreatePKBalanceDto } = require("./dto/pk-balance.dto");
const { formatErrorResponse } = require("../interceptor/responseFormatter");

module.exports = [
  {
    method: "GET",
    path: "/pk-balance/{year}",
    options: {
      tags: ["api", "Pk Balance"],
      description: "Get Pk Balance by year and Field Id",
      validate: {
        params: Joi.object({
          year: Joi.number().integer().required(),
        }),
        query: Joi.object({
          fieldId: Joi.number().integer().required(),
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
      const controller = new PKBalanceController(request, h);
      return controller.getPKBalanceByYearAndFieldId();
    },
  },
{
    method: "POST",
    path: "/pk-Balance",
    handler: async (request, h) => {
      const controller = new PKBalanceController(request, h);
      return controller.createPKBalance();
    },
    options: {
      tags: ["api", "PK Balance"],
      description: "Create PK Balance",
      validate: {
        payload: CreatePKBalanceDto,
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
    path: "/pk-Balance/{pKBalanceId}",
    handler: async (request, h) => {
      const controller = new PKBalanceController(request, h);
      return controller.updatePKBalance();
    },
    options: {
      tags: ["api", "pk Balance"],
      description: "Update PK Balance by Id",
      validate: {
        params: Joi.object({
            pKBalanceId: Joi.number().integer().required(),
        }),
        payload: CreatePKBalanceDto,
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
