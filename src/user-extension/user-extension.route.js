const Joi = require("joi");
const { formatErrorResponse } = require("../interceptor/responseFormatter");
const { UserExtensionController } = require("./user-extension.controller");
const { updateIsTermsOfUseAcceptedDto, updateDoNotShowAboutThisServiceDto, doNotShowAboutMannerDto } = require("./dto/user-extension.dto");
const { StatusCodeMapper } = require("../constants/http-status-codes-mapper");
const { validationFailAction } = require("../shared/validateFailSafeAction");

module.exports = [
  {
    method: "PUT",
    path: "/user-extension/accept-terms-of-use",
    options: {
      tags: ["api", "UserExtension"],
      description: "Update IsTermsOfUseAccepted in UserExtension",
      validate: {
        payload: updateIsTermsOfUseAcceptedDto,
        failAction: validationFailAction,
      },
    },
    handler: async (request, h) => {
      const controller = new UserExtensionController(request, h);
      return controller.updateIsTermsOfUseAccepted();
    },
  },
  {
    method: "PUT",
    path: "/user-extension/show-about-service",
    options: {
      tags: ["api", "UserExtension"],
      description: "Update DoNotShowAboutThisService in UserExtension",
      validate: {
        payload: updateDoNotShowAboutThisServiceDto,
        failAction: validationFailAction,
      },
    },
    handler: async (request, h) => {
      const controller = new UserExtensionController(request, h);
      return controller.updateDoNotShowAboutThisService();
    },
  },
  {
    method: "PUT",
    path: "/user-extension/do-not-show-about-manner",
    options: {
      tags: ["api", "UserExtension"],
      description: "Update DoNotShowAboutManner in UserExtension",
      validate: {
        payload: doNotShowAboutMannerDto,
        failAction: validationFailAction,
      },
    },
    handler: async (request, h) => {
      const controller = new UserExtensionController(request, h);
      return controller.updateDoNotShowAboutThisService();
    },
  },
  {
    method: "GET",
    path: "/user-extension",
    options: {
      tags: ["api", "UserExtension"],
      description: "Get UserExtension by UserID",
      validate: {
        failAction: validationFailAction
      },
    },
    handler: async (request, h) => {
      const controller = new UserExtensionController(request, h);
      return controller.getUserExtensionByUserId();
    },
  },
];
