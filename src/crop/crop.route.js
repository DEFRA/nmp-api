// crop.route.js
const Joi = require("joi");
const { CropController } = require("./crop.controller");
const {
  CreateCropWithManagementPeriodsDto,
  CreatePlanDto,
} = require("./dto/crops.dto");
const { formatErrorResponse } = require("../interceptor/responseFormatter");

module.exports = [
  {
    method: "GET",
    path: "/crops/plans/{harvestYear}",
    options: {
      tags: ["api", "Crop"],
      description: "Get Crop plans by harvest year",
      validate: {
        params: Joi.object({
          harvestYear: Joi.number().required(),
        }),
        query: Joi.object({
          farmId: Joi.number().required(),
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
      const controller = new CropController(request, h);
      return controller.getCropsPlansByHarvestYear();
    },
  },
  {
    method: "GET",
    path: "/crops/plans/fields/{harvestYear}",
    options: {
      tags: ["api", "Crop"],
      description: "Get crops plans field by harvest year and cropTypeID",
      validate: {
        params: Joi.object({
          harvestYear: Joi.number().integer().required(),
        }),
        query: Joi.object({
          cropTypeId: Joi.number().integer().optional(),
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
      const controller = new CropController(request, h);
      return controller.getCropsPlansFieldsByHarvestYearAndCropTypeId();
    },
  },
  {
    method: "GET",
    path: "/crops/plans/crop-types/{harvestYear}",
    options: {
      tags: ["api", "Crop"],
      description: "Get crops plans CropTypes by harvest year",
      validate: {
        params: Joi.object({
          harvestYear: Joi.number().required(),
        }),
        query: Joi.object({
          farmId: Joi.number().required(),
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
      const controller = new CropController(request, h);
      return controller.getCropsPlansCropTypesByHarvestYear();
    },
  },
  {
    method: "GET",
    path: "/crops/plans/management-periods/{harvestYear}",
    options: {
      tags: ["api", "Crop"],
      description: "Get crops plans management periods ids by harvest year",
      validate: {
        params: Joi.object({
          harvestYear: Joi.number().integer().required(),
        }),
        query: Joi.object({
          cropTypeId: Joi.number().integer().optional(),
          fieldIds: Joi.string()
            .required()
            .description("Comma separated Field Ids, e.g. 1,2,3"),
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
      const controller = new CropController(request, h);
      return controller.getCropsPlansManagementPeriodIdsByHarvestYear();
    },
  },
  {
    method: "GET",
    path: "/crops/fields/{fieldId}",
    options: {
      tags: ["api", "Crop"],
      description: "Get Crops By Field id",
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
      const controller = new CropController(request, h);
      return controller.getCropsByFieldId();
    },
  },
  {
    method: "GET",
    path: "/crops/plans",
    options: {
      tags: ["api", "Crop"],
      description: "Get Crop plans by farmId",
      validate: {
        query: Joi.object({
          farmId: Joi.number().integer().required(),
          type: Joi.number()
            .integer()
            .required()
            .description("0 for Plan, 1 for Record"),
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
      const controller = new CropController(request, h);
      return controller.getCropsPlansByFarmId();
    },
  },

  {
    method: "POST",
    path: "/crops/fields/{fieldId}",
    handler: async (request, h) => {
      const controller = new CropController(request, h);
      return controller.createCrop();
    },
    options: {
      tags: ["api", "Crop"],
      description: "Create Crop by Field Id",
      validate: {
        params: Joi.object({
          fieldId: Joi.number().integer().required(),
        }),
        payload: CreateCropWithManagementPeriodsDto,
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
    path: "/crops/plans",
    handler: async (request, h) => {
      const controller = new CropController(request, h);
      return controller.createNutrientsRecommendationForFieldByFieldId();
    },
    options: {
      tags: ["api", "Crop"],
      description: "Create Crop Plan",
      validate: {
        payload: CreatePlanDto,
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
    path: "/crops/crop-type/{fieldId}",
    options: {
      tags: ["api", "Crop"],
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
      const controller = new CropController(request, h);
      return controller.getCropTypeByFieldAndYear();
    },
  },
];