const Joi = require("joi"); // For validation


const MannerIncorporationMethodsController = require("./incorporation-method.controller");

module.exports = [
  {
    method: "GET",
    path: "/vendors/manner/incorporation-methods",
    handler: async (request, h) => {
      const controller = new MannerIncorporationMethodsController(request, h);
      return controller.getAllIncorporationMethods(request, h);
    },
    options: {
      tags: ["api", "Manner Incorporation Methods"],
      description: "Retrieve all incorporation methods",
    },
  },
  {
    method: "GET",
    path: "/vendors/manner/incorporation-methods/{id}",
    handler: async (request, h) => {
      const controller = new MannerIncorporationMethodsController(request, h);
      return controller.getIncorporationMethodsById(request, h);
    },
    options: {
      tags: ["api", "Manner Incorporation Methods"],
      description: "Retrieve incorporation method by Id'",
      validate: {
        params: Joi.object({
          id: Joi.number().required(),
        }),
      },
    },
  },
  {
    method: "GET",
    path: "/vendors/manner/incorporation-methods/by-app-method/{methodId}",
    handler: async (request, h) => {
      const controller = new MannerIncorporationMethodsController(request, h);
      return controller.getIncorporationMethodByIncorporationId(request, h);
    },
    options: {
      tags: ["api", "Manner Incorporation Methods"],
      description: "Retrieve incorporation Method by incorporation method ID",
      validate: {
        params: Joi.object({
          methodId: Joi.number().required(),
        }),
      },
    },
  },
  {
    method: "GET",
    path: "/vendors/manner/incorporation-methods/by-app-method-and-applicable-for/{methodId}",
    handler: async (request, h) => {
      const controller = new MannerIncorporationMethodsController(request, h);
      return controller.getIncorporationMethodByAppMethodAndApplicableFor(
        request,
        h
      );
    },
    options: {
      tags: ["api", "Manner Incorporation Methods"],
      description: "Retrieve incorporation methods by applications method ID",
      validate: {
        params: Joi.object({
          methodId: Joi.number().required(),
        }),
        query: Joi.object({
          applicableFor: Joi.string()
            .required()
            .description(
              "Filter by ApplicableFor ('G' for Grass, 'A' for Arable and Horticulture, 'B' for Both, 'NULL' for N/A)"
            ),
        }),
      },
    },
  },
];
