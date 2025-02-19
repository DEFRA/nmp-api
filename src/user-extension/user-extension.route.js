const Joi = require("joi");
const { formatErrorResponse } = require("../interceptor/responseFormatter");
const { UserExtensionController } = require("./user-extension.controller");
const { updateIsTermsOfUseAcceptedDto, updateDoNotShowAboutThisServiceDto } = require("./dto/user-extension.dto");

module.exports = [
  {
    method: "PUT",
    path: "/userExtension/AcceptTermsOfUse",
    options: {
      tags: ["api", "UserExtension"],
      description: "Update IsTermsOfUseAccepted in UserExtension",
      validate: {
        payload: updateIsTermsOfUseAcceptedDto,
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
      const controller = new UserExtensionController(request, h);
      return controller.updateIsTermsOfUseAccepted();
    },
  },
  {
    method: "PUT",
    path: "/userExtension/ShowAboutService",
    options: {
      tags: ["api", "UserExtension"],
      description: "Update DoNotShowAboutThisService in UserExtension",
      validate: {
        payload: updateDoNotShowAboutThisServiceDto,
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
      const controller = new UserExtensionController(request, h);
      return controller.updateDoNotShowAboutThisService();
    },
  },
];
