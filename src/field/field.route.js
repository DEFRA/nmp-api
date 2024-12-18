const Joi = require("joi");
const { formatErrorResponse } = require("../interceptor/responseFormatter");
const { FieldController } = require("./field.controller");
const {
  UpdateFieldDtoSchema,
  FieldEntitySchema,
  CreateFieldWithSoilAnalysisAndCropsDto,
} = require("./dto/field.dto");

module.exports = [
  {
    method: "GET",
    path: "/fields/{fieldId}",
    options: {
      tags: ["api", "Field"],
      description: "Get field by Field Id",
      validate: {
        params: Joi.object({
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
      const controller = new FieldController(request, h);
      return controller.getById();
    },
  },

  {
    method: "GET",
    path: "/fields/info/{fieldId}",
    options: {
      tags: ["api", "Field"],
      description: "Get Field Crop and Soil details by Field Id",
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
    },
    handler: async (request, h) => {
      const controller = new FieldController(request, h);
      return controller.getFieldCropAndSoilDetails();
    },
  },
  {
    method: "GET",
    path: "/fields/farms/{farmId}",
    options: {
      tags: ["api", "Field"],
      description: "Get Fields by Farm Id",
      validate: {
        params: Joi.object({
          farmId: Joi.number().integer().required(),
        }),
        query: Joi.object({
          shortSummary: Joi.boolean(),
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
      const controller = new FieldController(request, h);
      return controller.getFieldsByFarmId();
    },
  },
  {
    method: "GET",
    path: "/fields/farms/{farmId}/count",
    options: {
      tags: ["api", "Field"],
      description: "Get fields count by Farm Id",
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
      const controller = new FieldController(request, h);
      return controller.getFarmFieldsCount();
    },
  },
  {
    method: "GET",
    path: "/fields/farms/{farmId}/exists",
    options: {
      tags: ["api", "Field"],
      description: "Api to check field exists using FarmId and Name",
      validate: {
        params: Joi.object({
          farmId: Joi.number().integer().required(),
        }),
        query: Joi.object({
          name: Joi.string().required(),
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
      const controller = new FieldController(request, h);
      return controller.checkFarmFieldExists();
    },
  },
  {
    method: "PUT",
    path: "/fields/{fieldId}",
    options: {
      tags: ["api", "Field"],
      description: "Update Field by FieldId",
      validate: {
        params: Joi.object({
          fieldId: Joi.number().integer().required(),
        }),
        payload: UpdateFieldDtoSchema, // Validate payload with UpdateFieldDtoSchema
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
      const controller = new FieldController(request, h);
      return controller.updateField();
    },
  },
  {
    method: "POST",
    path: "/fields/farms/{farmId}",
    options: {
      tags: ["api", "Field"],
      description: "Create Field along with Soil Analyses and Crops",
      validate: {
        params: Joi.object({
          farmId: Joi.number().integer().required(),
        }),
        payload: CreateFieldWithSoilAnalysisAndCropsDto, // Schema to validate the request body
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
      const fieldController = new FieldController(request, h);
      return fieldController.createFieldWithSoilAnalysisAndCrops();
    },
  },
  {
    method: "DELETE",
    path: "/fields/{fieldId}",
    options: {
      tags: ["api", "Field"],
      description: "Delete Field by Field Id",
      validate: {
        params: Joi.object({
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
      const controller = new FieldController(request, h);
      return controller.deleteFieldById();
    },
  },
  {
    method: "GET",
    path: "/fields/fieldSoilSnsInfo/{fieldId}",
    options: {
      tags: ["api", "Field"],
      description: "Get Field SoilAnalysis and SnsAnalysis details by Field Id",
      validate: {
        params: Joi.object({
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
      const controller = new FieldController(request, h);
      return controller.getFieldSoilAnalysisAndSnsAnalysis();
    },
  },

  {
    method: "GET",
    path: "/fields/fieldRelatedData/{fieldId}",
    options: {
      tags: ["api", "Field"],
      description: "Get field data by Field ID(s) and Year",
      validate: {
        params: Joi.object({
          fieldId: Joi.string()
            .pattern(/^[0-9]+(,[0-9]+)*$/) // Validate FieldIDs (comma-separated)
            .required(),
        }),
        query: Joi.object({
          year: Joi.number().integer().required(), // Expecting year as a query parameter
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
      const controller = new FieldController(request, h);
      return controller.getFieldRelatedData();
    },
  },
];
