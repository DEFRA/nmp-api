const Joi = require("joi"); // For validation


const MannerIncorporationDelayController = require("./incorporation-delay.controller");

module.exports = [
  {
    method: "GET",
    path: "/vendors/manner/incorporation-delays",
    handler: async (request, h) => {
      const controller = new MannerIncorporationDelayController(request, h);
      return controller.getAllIncorporationDelays(request, h);
    },
    options: {
      tags: ["api", "Manner Incorporation Delays"],
      description: "Retrieve all incorporation delays",
    },
  },
  {
    method: "GET",
    path: "/vendors/manner/incorporation-delays/{id}",
    handler: async (request, h) => {
      const controller = new MannerIncorporationDelayController(request, h);
      return controller.getIncorporationDelayById(request, h);
    },
    options: {
      tags: ["api", "Manner Incorporation Delays"],
      description: "Retrieve incorporation delay by ID",
      validate: {
        params: Joi.object({
          id: Joi.number().required(),
        }),
      },
    },
  },
  {
    method: "GET",
    path: "/vendors/manner/incorporation-delays/by-incorp-method/{methodId}",
    handler: async (request, h) => {
      const controller = new MannerIncorporationDelayController(request, h);
      return controller.getIncorporationDelayByIncorporationId(request, h);
    },
    options: {
      tags: ["api", "Manner Incorporation Delays"],
      description: "Retrieve incorporation delays by incorporation method ID",
      validate: {
        params: Joi.object({
          methodId: Joi.number().required(),
        }),
      },
    },
  },
  {
    method: "GET",
    path: "/vendors/manner/incorporation-delays/by-incorp-method-and-applicable-for/{methodId}",
    handler: async (request, h) => {
      const controller = new MannerIncorporationDelayController(request, h);
      return controller.getIncorporationMethodByAppMethodAndApplicableFor(
        request,
        h
      );
    },
    options: {
      tags: ["api", "Manner Incorporation Delays"],
      description: "Retrieve incorporation method by applications method ID",
      validate: {
        params: Joi.object({
          methodId: Joi.number().required(),
        }),
        query: Joi.object({
          applicableFor: Joi.string()
            .required()
            .description(
              "Filter by ApplicableFor (L for Liquid, S for Solid, P for Poultry, NULL for N/A or Not Incorporated)"
            ),
        }),
      },
    },
  },
];
