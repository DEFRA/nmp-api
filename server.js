"use strict";

require("dotenv").config();
const { createConnection } = require("typeorm");
const hapi = require("@hapi/hapi");
const inert = require("@hapi/inert");
const vision = require("@hapi/vision");
const hapiSwagger = require("hapi-swagger");

const pack = require("./package");
const routes = require("./src/routes");
const ormConfig = require("./src/db/ormConfig");

const { AzureAuthMiddleware } = require("./src/middleware/azureAuth.middleware");
const responseHandlerPlugin = require("./src/interceptor/response.interceptor");
const EnvironmentService = require("./src/shared/environment.service");

const init = async () => {
  const swaggerOptions = {
    info: {
      title: "Nutrients Management Planning Api",
      version: pack.version,
    },
    schemes: ["http","https"],
    documentationPath: EnvironmentService.APPLICATION_SWAGGER_PATH() || "/docs",
    grouping: "tags",
    securityDefinitions: {
      Bearer: {
        type: "apiKey",
        name: "Authorization",
        in: "header",
        description:
          "Enter the Bearer Authorization string as following: Bearer [Generated-JWT-Token].",
      },
    },
    security: [
      {
        Bearer: [],
      },
    ],
  };

  await createConnection(ormConfig);
  const azureAuthMiddleware = new AzureAuthMiddleware();

  const server = hapi.server({
    port: process.env.PORT ?? EnvironmentService.APPLICATION_PORT(),
    // Use the port provided by IIS,
    // host: "localhost",
  });

  await server.register([
    inert,
    vision,
    {
      plugin: hapiSwagger,
      options: swaggerOptions,
    },
    responseHandlerPlugin,
  ]);

  server.ext("onPreHandler", (request, h) => {
    return azureAuthMiddleware.use(request, h);
  });

  server.route(routes);

  server.events.on("response", function (request) {
    console.log(
      request.info.remoteAddress +
        ": " +
        request.method.toUpperCase() +
        " " +
        request.path +
        " --> " +
        request.response.statusCode
    );
  });

  await server.start();
  console.log("Server running on %s", server.info.uri);
};

process.on("unhandledRejection", (err) => {
  process.exit(1);
});

init();
