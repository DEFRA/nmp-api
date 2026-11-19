const Joi = require("joi");
const { RB209MeasurementController } = require("./measurement.controller");
const { CalculateSnsIndexRequest, smnCalculationRequest } = require("./dto/measurement.dto");
const {
  formatErrorResponse,
} = require("../../../interceptor/responseFormatter");
const { validationFailAction } = require("../../../shared/validateFailSafeAction");

const getController = (request, h) =>
  new RB209MeasurementController(request, h);
const measurementDescriptionVendorTag = "RB209 Measurement";
module.exports = [
  {
    method: "GET",
    path: "/vendors/rb209/Measurement/CropHeights",
    handler: async (request, h) => {
      return getController(request, h).getCropHeights();
    },
    options: {
      tags: ["api", measurementDescriptionVendorTag],
      description: "Full list of available Crop Heights",
    },
  },
  {
    method: "GET",
    path: "/vendors/rb209/Measurement/GreenAreaIndexes",
    handler: async (request, h) => {
      return getController(request, h).getGreenAreaIndexes();
    },
    options: {
      tags: ["api", measurementDescriptionVendorTag],
      description: "Full list of available Green Area Indexes",
    },
  },
  {
    method: "GET",
    path: "/vendors/rb209/Measurement/Seasons",
    handler: async (request, h) => {
      return getController(request, h).getSeasons();
    },
    options: {
      tags: ["api", measurementDescriptionVendorTag],
      description: "Full list of available Seasons",
    },
  },

  {
    method: "GET",
    path: "/vendors/rb209/Measurement/ShootNumbers",
    handler: async (request, h) => {
      return getController(request, h).getShootNumbers();
    },
    options: {
      tags: ["api", measurementDescriptionVendorTag],
      description: "Full list of available Shoot Numbers",
    },
  },

  {
    method: "GET",
    path: "/vendors/rb209/Measurement/SmnConversionMethod/{smnValue}/{soilLayer}",
    handler: async (request, h) => {
      return getController(
        request,
        h,
      ).getSmnConversionMethodBySmnValueAndSoilLayer();
    },
    options: {
      tags: ["api", measurementDescriptionVendorTag],
      description: "The get SMN value to be converted from N/kg to kg/ha",
      validate: {
        params: Joi.object({
          smnValue: Joi.string().required().description("smn value in N/kg"),
          soilLayer: Joi.string().required().description("layer of soil in cm"),
        }),
        failAction: validationFailAction,
      },
    },
  },

  {
    method: "POST",
    path: "/vendors/rb209/Measurement/MeasurementMethodEngWal",
    handler: async (request, h) => {
      return getController(request, h).calculateSnsIndex();
    },
    options: {
      tags: ["api", measurementDescriptionVendorTag],
      description:
        "The endpoint to calculate SNS Index using the Measurement Method in England & Wales",
      validate: {
        payload: CalculateSnsIndexRequest,
        failAction: validationFailAction,
      },
    },
  },
  {
    method: "POST",
    path: "/vendors/rb209/Measurement/MeasurementMethodScotland",
    handler: async (request, h) => {
      return getController(request, h).calculateResidueGroup();
    },
    options: {
      tags: ["api", measurementDescriptionVendorTag],
      description: "The endpoint to calculate residue group using SMN measurement values in Scotland.",
      validate: {
        payload: smnCalculationRequest,
        failAction: validationFailAction
      },
    },
  },
];
