const { validationFailAction } = require("../shared/validateFailSafeAction");
const { MannerFarmsController } = require("./manner-farms.controller");
const Joi = require("joi");
const mannerFarms = "Manner Farms";
module.exports = [
     {
    method: "GET",
    path: "/manner-farms/manner-farms-by-id/{id}",
    options: {
      tags: ["api", mannerFarms],
      description: "Get Manner Farms by ID",
      validate: {
        params: Joi.object({
          id: Joi.number().integer().required(),
        }),
        failAction: validationFailAction,
      },
    },
    handler: async (request, h) => {
      const controller = new MannerFarmsController(request, h);
      return controller.getById();
    },
  },
    {
        method: "GET",
        path: "/manner-farms/{organisationId}",
        options: {
            tags: ["api", mannerFarms],
            description: "Get Manner Farms by Organisation ID",
            validate: {
                params: Joi.object({
                    organisationId: Joi.string().guid().required(),
                }),
                failAction: validationFailAction,
            },
        },
        handler: async (request, h) => {
            const controller = new MannerFarmsController(request, h);
            return controller.getByOrganisationId();
        },
    }
];