const Joi = require("joi");
const {
  RB209OrganicMaterialController,
} = require("./organic-material.controller");
const {
  formatErrorResponse,
} = require("../../../interceptor/responseFormatter");

module.exports = [
  {
    method: "GET",
    path: "/vendors/rb209/OrganicMaterial/OrganicMaterialCategories",
    handler: async (request, h) => {
      const controller = new RB209OrganicMaterialController(request, h);
      return controller.getOrganicMaterialCategories();
    },
    options: {
      tags: ["api", "RB209 OrganicMaterial"],
      description:
        "This endpoint is used to return Organic Material Categories",
    },
  },
  {
    method: "GET",
    path: "/vendors/rb209/OrganicMaterial/OrganicMaterialTypes",
    handler: async (request, h) => {
      const controller = new RB209OrganicMaterialController(request, h);
      return controller.getOrganicMaterialTypes();
    },
    options: {
      tags: ["api", "RB209 OrganicMaterial"],
      description:
        "This endpoint is used to return Organic Material Types, with optional filtering by dryMatterSplit or organicMaterialCategoryId",
      validate: {
        query: Joi.object({
          dryMatterSplit: Joi.boolean().optional(),
          organicMaterialCategoryId: Joi.string().optional(),
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
    path: "/vendors/rb209/OrganicMaterial/IncorporationMethods/{organicMaterialTypeId}",
    handler: async (request, h) => {
      const controller = new RB209OrganicMaterialController(request, h);
      return controller.getIncorporationMethodsByOrganicMaterialTypeId();
    },
    options: {
      tags: ["api", "RB209 OrganicMaterial"],
      description:
        "Organic Material Incorporation Method list based on OrganicMaterialTypeId",
      validate: {
        params: Joi.object({
          organicMaterialTypeId: Joi.string().required(),
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
    path: "/vendors/rb209/OrganicMaterial/IncorporationMethods",
    handler: async (request, h) => {
      const controller = new RB209OrganicMaterialController(request, h);
      return controller.getIncorporationMethods();
    },
    options: {
      tags: ["api", "RB209 OrganicMaterial"],
      description: "Organic Material Incorporation Method list",
    },
  },
  {
    method: "GET",
    path: "/vendors/rb209/OrganicMaterial/IncorporationMethod/{incorporationMethodId}",
    handler: async (request, h) => {
      const controller = new RB209OrganicMaterialController(request, h);
      return controller.getIncorporationMethodByIncorporationMethodId();
    },
    options: {
      tags: ["api", "RB209 OrganicMaterial"],
      description:
        "Organic Material Incorporation Method Item based on Incorporation Method ID",
      validate: {
        params: Joi.object({
          incorporationMethodId: Joi.string().required(),
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
    path: "/vendors/rb209/OrganicMaterial/OrganicMaterialTypeItem/{organicMaterialTypeId}/{dryMatterSplit}",
    handler: async (request, h) => {
      const controller = new RB209OrganicMaterialController(request, h);
      return controller.getOrganicMaterialTypeItemByOrganicMaterialTypeIdAndDryMatterSplit();
    },
    options: {
      tags: ["api", "RB209 OrganicMaterial"],
      description:
        "Returns the organic material type item based on the provided organicMaterialTypeId and dryMatterSplit",
      validate: {
        params: Joi.object({
          organicMaterialTypeId: Joi.string().required(),
          dryMatterSplit: Joi.boolean().required(),
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
    path: "/vendors/rb209/OrganicMaterial/OrganicMaterialTypeItem/{organicMaterialTypeId}",
    handler: async (request, h) => {
      const controller = new RB209OrganicMaterialController(request, h);
      return controller.getOrganicMaterialTypeItemByOrganicMaterialTypeId();
    },
    options: {
      tags: ["api", "RB209 OrganicMaterial"],
      description:
        "Returns the organic material type item based on the provided organicMaterialTypeId",
      validate: {
        params: Joi.object({
          organicMaterialTypeId: Joi.string().required(),
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
    path: "/vendors/rb209/OrganicMaterial/OrganicMaterialCategoryItem/{organicMaterialCategoryId}",
    handler: async (request, h) => {
      const controller = new RB209OrganicMaterialController(request, h);
      return controller.getOrganicMaterialCategoryItemByOrganicMaterialCategoryId();
    },
    options: {
      tags: ["api", "RB209 OrganicMaterial"],
      description:
        "Returns the organic material category item based on the provided organicMaterialCategoryId",
      validate: {
        params: Joi.object({
          organicMaterialCategoryId: Joi.string().required(),
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
