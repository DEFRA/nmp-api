const Joi = require("joi");
const { RB209ArableController } = require("./arable.controller");
const {
  formatErrorResponse,
} = require("../../../interceptor/responseFormatter");

module.exports = [
  {
    method: "GET",
    path: "/vendors/rb209/Arable/CropGroups",
    handler: async (request, h) => {
      const controller = new RB209ArableController(request, h);
      return controller.getCropGroups();
    },
    options: {
      tags: ["api", "RB209 Arable"],
      description: "The full list of available Crop Groups",
    },
  },
  {
    method: "GET",
    path: "/vendors/rb209/Arable/CropGroup/{cropGroupId}",
    handler: async (request, h) => {
      const controller = new RB209ArableController(request, h);
      return controller.getCropGroupsBycropGroupId();
    },
    options: {
      tags: ["api", "RB209 Arable"],
      description: "Individual Crop Group - filtered by Crop Group Id",
      validate: {
        params: Joi.object({
          cropGroupId: Joi.string().required(),
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
    path: "/vendors/rb209/Arable/CropTypes",
    handler: async (request, h) => {
      const controller = new RB209ArableController(request, h);
      return controller.getCropTypes();
    },
    options: {
      tags: ["api", "RB209 Arable"],
      description: "The full list of available Crop Types",
    },
  },
  {
    method: "GET",
    path: "/vendors/rb209/Arable/CropTypes/{cropGroupId}",

    handler: async (request, h) => {
      const controller = new RB209ArableController(request, h);
      return controller.getCropTypesByCropGroupId();
    },
    options: {
      tags: ["api", "RB209 Arable"],
      description:
        "A filtered list of available Crop Types - filtered by Crop Group Id",
      validate: {
        params: Joi.object({
          cropGroupId: Joi.string().required(),
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
    path: "/vendors/rb209/Arable/CropType/{cropTypeId}",
    options: {
      tags: ["api", "RB209 Arable"],
      description: "Individual Crop Type - filtered by Crop Type Id",
      validate: {
        params: Joi.object({
          cropTypeId: Joi.string().required(),
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
      const controller = new RB209ArableController(request, h);
      return controller.getCropInfo1sByCropTypeId(request, h);
    },
  },
  {
    method: "GET",
    path: "/vendors/rb209/Arable/CropInfo1s",
    options: {
      tags: ["api", "RB209 Arable"],
      description: "The full list of available Crop Info 1s",
    },
    handler: async (request, h) => {
      const controller = new RB209ArableController(request, h);
      return controller.getCropInfo1s(request, h);
    },
  },
  {
    method: "GET",
    path: "/vendors/rb209/Arable/CropInfo1s/{cropTypeId}",
    options: {
      tags: ["api", "RB209 Arable"],
      description:
        "A filtered list of available Crop Info 1s - filtered by Crop Type Id",
      validate: {
        params: Joi.object({
          cropTypeId: Joi.string().required(),
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
      const controller = new RB209ArableController(request, h);
      return controller.getCropInfo1sByCropTypeId(request, h);
    },
  },
  {
    method: "GET",
    path: "/vendors/rb209/Arable/CropInfo1/{cropTypeId}/{cropInfo1Id}",
    options: {
      tags: ["api", "RB209 Arable"],
      description:
        "Individual Crop Info 1 - filtered by Crop Type Id and Crop Info 1 Id",
      validate: {
        params: Joi.object({
          cropTypeId: Joi.string().required(),
          cropInfo1Id: Joi.string().required(),
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
      const controller = new RB209ArableController(request, h);
      return controller.getCropInfo1ByCropTypeIdAndCropInfo1Id(request, h);
    },
  },
  {
    method: "GET",
    path: "/vendors/rb209/Arable/CropInfo2s",
    options: {
      tags: ["api", "RB209 Arable"],
      description:
        "The full list of available Crop Info 2s (only required for Arable Cereals crops)",
    },
    handler: async (request, h) => {
      const controller = new RB209ArableController(request, h);
      return controller.getCropInfo2s(request, h);
    },
  },
  {
    method: "GET",
    path: "/vendors/rb209/Arable/CropInfo2/{cropInfo2Id}",
    options: {
      tags: ["api", "RB209 Arable"],
      description:
        "Individual Crop Info 2 - filtered by Crop Info 2 Id (only required for Arable Cereals crops)",
      validate: {
        params: Joi.object({
          cropInfo2Id: Joi.string().required(),
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
      const controller = new RB209ArableController(request, h);
      return controller.getCropInfo2CropInfo2Id(request, h);
    },
  },
  {
    method: "GET",
    path: "/vendors/rb209/Arable/PotatoGroups",
    options: {
      tags: ["api", "RB209 Arable"],
      description:
        "The full list of available Potato Groups (only required for Arable Potato crops)",
    },
    handler: async (request, h) => {
      const controller = new RB209ArableController(request, h);
      return controller.getPotatoGroups(request, h);
    },
  },
  {
    method: "GET",
    path: "/vendors/rb209/Arable/PotatoGroup/{potatoGroupId}",
    options: {
      tags: ["api", "RB209 Arable"],
      description:
        "Individual Potato Group - filtered by Potato Group Id (only required for Arable Potato crops)",
      validate: {
        params: Joi.object({
          potatoGroupId: Joi.string().required(),
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
      const controller = new RB209ArableController(request, h);
      return controller.getPotatoGroupByPotatoGroupId(request, h);
    },
  },
  {
    method: "GET",
    path: "/vendors/rb209/Arable/PotatoVarieties",
    options: {
      tags: ["api", "RB209 Arable"],
      description:
        "The full list of available Potato Varieties (only required for Arable Potato crops)",
    },
    handler: async (request, h) => {
      const controller = new RB209ArableController(request, h);
      return controller.getPotatoVarieties(request, h);
    },
  },
  {
    method: "GET",
    path: "/vendors/rb209/Arable/PotatoVarieties/{potatoGroupId}",
    options: {
      tags: ["api", "RB209 Arable"],
      description:
        "A filtered list of available Potato Varieties - filtered by Potato Group Id (only required for Arable Potato crops)",
      validate: {
        params: Joi.object({
          potatoGroupId: Joi.string().required(),
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
      const controller = new RB209ArableController(request, h);
      return controller.getPotatoVarietiesByPotatoGroupId(request, h);
    },
  },
  {
    method: "GET",
    path: "/vendors/rb209/Arable/PotatoVariety/{potatoVarietyId}",
    options: {
      tags: ["api", "RB209 Arable"],
      description:
        "Individual Potato Variety - filtered by Potato Variety Id (only required for Arable Potato crops)",
      validate: {
        params: Joi.object({
          potatoVarietyId: Joi.string().required(),
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
      const controller = new RB209ArableController(request, h);
      return controller.getPotatoVarietyByPotatoVarietyId(request, h);
    },
  },
];
