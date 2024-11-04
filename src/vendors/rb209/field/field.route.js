const { RB209FieldController } = require("./field.controller");
const Joi = require("joi");
const {
  formatErrorResponse,
} = require("../../../interceptor/responseFormatter");

module.exports = [
  {
    method: "GET",
    path: "/vendors/rb209/Field/Countries",
    handler: async (request, h) => {
      const controller = new RB209FieldController(request, h);
      return controller.getCountries();
    },
    options: {
      tags: ["api", "RB209 Field"],
      description: "The full list of available Countries",
    },
  },
  {
    method: "GET",
    path: "/vendors/rb209/Field/Country/{countryId}",
    handler: async (request, h) => {
      const controller = new RB209FieldController(request, h);
      return controller.getCountryByCountryId();
    },
    options: {
      tags: ["api", "RB209 Field"],
      description:
        "Individual Country Text filtered from the supplied corresponding Country Id",
      validate: {
        params: Joi.object({
          countryId: Joi.string().required(),
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
    path: "/vendors/rb209/Field/FieldTypes/{countryId}",
    handler: async (request, h) => {
      const controller = new RB209FieldController(request, h);
      return controller.getFieldTypesByCountryId();
    },
    options: {
      tags: ["api", "RB209 Field"],
      description: "The full list of available Field Types",
      validate: {
        params: Joi.object({
          countryId: Joi.string().required(),
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
    path: "/vendors/rb209/Field/FieldType/{fieldTypeId}",
    handler: async (request, h) => {
      const controller = new RB209FieldController(request, h);
      return controller.getFieldTypeByFieldTypeId();
    },
    options: {
      tags: ["api", "RB209 Field"],
      description:
        "Individual Field Type Text filtered from the supplied corresponding Field Type Id",
      validate: {
        params: Joi.object({
          fieldTypeId: Joi.string().required(),
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
    path: "/vendors/rb209/Field/Nutrient/{nutrientId}",
    handler: async (request, h) => {
      const controller = new RB209FieldController(request, h);
      return controller.getNutrientByNutrientId();
    },
    options: {
      tags: ["api", "RB209 Field"],
      description:
        "Individual Nutrient Text filtered from the supplied corresponding Nutrient Id",
      validate: {
        params: Joi.object({
          nutrientId: Joi.string().required(),
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
    path: "/vendors/rb209/Field/Nutrients",
    handler: async (request, h) => {
      const controller = new RB209FieldController(request, h);
      return controller.getNutrients(request, h);
    },
    options: {
      tags: ["api", "RB209 Field"],
      description: "The full list of available Nutrients",
    },
  },
  {
    method: "GET",
    path: "/vendors/rb209/Field/SecondCropType_List/{cropGroupId1}/{cropTypeId1}/{cropGroupId2}/{countryId}",
    handler: async (request, h) => {
      const controller = new RB209FieldController(request, h);
      return controller.getSecondCropType_ListByCropGroupId1AndCropTypeId1AndCropGroupId2AndCountryId(
        request,
        h
      );
    },
    options: {
      tags: ["api", "RB209 Field"],
      description:
        "Some Crops (both Arable and Grassland) allow a second Crop to be sown in the same Crop Year: The filtered list of available Second Crop Types after the first Crop",
      validate: {
        params: Joi.object({
          cropGroupId1: Joi.string().required(),
          cropTypeId1: Joi.string().required(),
          cropGroupId2: Joi.string().required(),
          countryId: Joi.string().required(),
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
    path: "/vendors/rb209/Field/SiteClass/{siteClassId}",
    handler: async (request, h) => {
      const controller = new RB209FieldController(request, h);
      return controller.getSiteClassBySiteClassId(request, h);
    },
    options: {
      tags: ["api", "RB209 Field"],
      description: "The full list of available Nutrients",
      validate: {
        params: Joi.object({
          siteClassId: Joi.string().required(),
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
    path: "/vendors/rb209/Field/SiteClasses/{countryId}",
    handler: async (request, h) => {
      const controller = new RB209FieldController(request, h);
      return controller.getSiteClassesByCountryId(request, h);
    },
    options: {
      tags: ["api", "RB209 Field"],
      description: "Site Class list",
      validate: {
        params: Joi.object({
          countryId: Joi.string().required(),
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
    path: "/vendors/rb209/Field/SiteClassItem/{soilTypeId}/{altitude}/{postcode}/{countryId}",
    handler: async (request, h) => {
      const controller = new RB209FieldController(request, h);
      return controller.getSiteClassItemBySoilTypeIdAndAltitudeAndPostcodeAndCountryId(
        request,
        h
      );
    },
    options: {
      tags: ["api", "RB209 Field"],
      description: "Site Class list",
      validate: {
        params: Joi.object({
          soilTypeId: Joi.string().required(),
          altitude: Joi.string().required(),
          postcode: Joi.string().required(),
          countryId: Joi.string().required(),
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
