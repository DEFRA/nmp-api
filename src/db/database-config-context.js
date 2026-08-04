const EnvironmentService = require("../shared/environment.service");

const defaultRequestTimeout = 120000;
const defaultConnectTimeout = 30000;

function getDatabaseConnectionContext({ entities, additionalBaseConfig = {} }) {
  const isProduction = EnvironmentService.nodeEnv() === "production";
  const dbRequestTimeout = Number.parseInt(
    process.env.DB_REQUEST_TIMEOUT_MS,
    10,
  );
  const dbConnectTimeout = Number.parseInt(
    process.env.DB_CONNECT_TIMEOUT_MS,
    10,
  );
  const requestTimeout = Number.isFinite(dbRequestTimeout)
    ? dbRequestTimeout
    : defaultRequestTimeout;
  const connectTimeout = Number.isFinite(dbConnectTimeout)
    ? dbConnectTimeout
    : defaultConnectTimeout;

  const baseConfig = {
    type: "mssql",
    host: EnvironmentService.databaseHost(),
    port: EnvironmentService.databasePort(),
    database: EnvironmentService.databaseName(),
    entities,
    ...additionalBaseConfig,
  };

  return {
    isProduction,
    requestTimeout,
    connectTimeout,
    baseConfig,
  };
}

module.exports = {
  getDatabaseConnectionContext,
};
