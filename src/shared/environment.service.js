require("dotenv").config();

class EnvironmentService {
  static getEnv(envName) {
    const envValue = process.env[envName];
    if (envValue !== undefined) {
      return envValue;
    }
    console.warn(`Environment variable ${envName} does not exist`);
  }

  static nodeEnv() {
    return this.getEnv("NODE_ENV");
  }

  static azureAdConnectionType() {
    return this.getEnv("AZURE_AD_CONNECTION_TYPE");
  }

  static databaseHost() {
    return this.getEnv("DATABASE_HOST");
  }

  static databasePort() {
    return Number.parseInt(this.getEnv("DATABASE_PORT"));
  }

  static databaseName() {
    return process.env.NODE_ENV === "test"
      ? this.getEnv("TEST_DATABASE_NAME")
      : this.getEnv("DATABASE_NAME");
  }

  static databaseUser() {
    return this.getEnv("DATABASE_USER");
  }

  static databasePassword() {
    return this.getEnv("DATABASE_PASSWORD");
  }

  static applicationVer() {
    return this.getEnv("APPLICATION_VER");
  }

  static applicationUrl() {
    return this.getEnv("APPLICATION_URL");
  }

  static applicationPort() {
    return this.getEnv("APPLICATION_PORT");
  }

  static applicationSwaggerPath() {
    return this.getEnv("APPLICATION_SWAGGER_PATH");
  }

  static applicationApiKey() {
    return this.getEnv("APPLICATION_API_KEY");
  }

  static RB209_BASE_URL() {
    return this.getEnv("RB209_BASE_URL");
  }

  static RB209_USER_EMAIL() {
    return this.getEnv("RB209_USER_EMAIL");
  }

  static RB209_USER_PASSWORD() {
    return this.getEnv("RB209_USER_PASSWORD");
  }

  static ADDR_LOOKUP_BASE_URL() {
    return this.getEnv("ADDR_LOOKUP_BASE_URL");
  }

  static ADDR_LOOKUP_SUBSCRIPTION_KEY() {
    return this.getEnv("ADDR_LOOKUP_SUBSCRIPTION_KEY");
  }

  static ADDR_SCOPE() {
    return this.getEnv("ADDR_SCOPE");
  }

  static ADDR_CLIENT_ID() {
    return this.getEnv("ADDR_CLIENT_ID");
  }

  static ADDR_CLIENT_SECRET() {
    return this.getEnv("ADDR_CLIENT_SECRET");
  }

  static ADDR_TENANT_ID() {
    return this.getEnv("ADDR_TENANT_ID");
  }

  static MANNER_BASE_URL() {
    return this.getEnv("MANNER_BASE_URL");
  }

  static APPLICATION_ENV() {
    return this.getEnv("APPLICATION_ENV");
  }

  static AZURE_AD_B2C_TENANT_NAME() {
    return this.getEnv("AZURE_AD_B2C_TENANT_NAME");
  }

  static AZURE_AD_B2C_POLICY_NAME() {
    return this.getEnv("AZURE_AD_B2C_POLICY_NAME");
  }

  static AZURE_AD_B2C_CLIENT_ID() {
    return this.getEnv("AZURE_AD_B2C_CLIENT_ID");
  }

  static AZURE_IDENTITY_INSTANCE() {
    return this.getEnv("AZURE_IDENTITY_INSTANCE");
  }

  static azureIdentityMetadataUrl() {
    return this.getEnv("AZURE_IDENTITY_METADATA_URL");
  }

  static AZURE_IDENTITY_DOMAIN() {
    return this.getEnv("AZURE_IDENTITY_DOMAIN");
  }
}

module.exports = EnvironmentService;
