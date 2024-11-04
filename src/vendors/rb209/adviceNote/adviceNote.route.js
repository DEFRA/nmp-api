const Joi = require("joi");
const { RB209AdviceNoteController } = require("./adviceNote.controller");
const {
  formatErrorResponse,
} = require("../../../interceptor/responseFormatter");

module.exports = [
  {
    method: "GET",
    path: "/vendors/rb209/AdviceNote/AdviceNotes",
    handler: async (request, h) => {
      const controller = new RB209AdviceNoteController(request, h);
      return controller.getAdviceNotes(request, h);
    },
    options: {
      tags: ["api", "RB209 AdviceNote"],
      description: "The full list of available Advice Notes",
    },
  },
  {
    method: "GET",
    path: "/vendors/rb209/AdviceNote/AdviceNote/{adviceNoteCode}",
    handler: async (request, h) => {
      const controller = new RB209AdviceNoteController(request, h);
      return controller.getAdviceNotesByAdviceNoteCode(request, h);
    },
    options: {
      tags: ["api", "RB209 AdviceNote"],
      description: "Available Advice Note for AdviceNote Code",
      validate: {
        params: Joi.object({
          adviceNoteCode: Joi.string().required(),
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
