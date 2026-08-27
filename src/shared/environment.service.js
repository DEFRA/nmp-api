require("dotenv").config();

class EnvironmentService {
  static getEnv(envName) {
    const envValue = process.env[envName];
    if (envValue !== undefined) {
      return envValue;
    }
    console.warn(`Environment variable ${envName} does not exist`);
     return `Environment variable ${envName} does not exist`
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

  static rb209BaseUrl() {
    return this.getEnv("RB209_BASE_URL");
  }

  static rb209UserEmail() {
    return this.getEnv("RB209_USER_EMAIL");
  }

  static rb209UserPassword() {
    return this.getEnv("RB209_USER_PASSWORD");
  }

  static addrLookupBaseUrl() {
    return this.getEnv("ADDR_LOOKUP_BASE_URL");
  }

  static addrLookupSubscriptionKey() {
    return this.getEnv("ADDR_LOOKUP_SUBSCRIPTION_KEY");
  }

  static addrScope() {
    return this.getEnv("ADDR_SCOPE");
  }

  static addrClientId() {
    return this.getEnv("ADDR_CLIENT_ID");
  }

  static addrClientSecret() {
    return this.getEnv("ADDR_CLIENT_SECRET");
  }

  static addrTenantId() {
    return this.getEnv("ADDR_TENANT_ID");
  }

  static mannerBaseUrl() {
    return this.getEnv("MANNER_BASE_URL");
  }

  static applicationEnv() {
    return this.getEnv("APPLICATION_ENV");
  }

  static azureAdB2CTenantName() {
    return this.getEnv("AZURE_AD_B2C_TENANT_NAME");
  }

  static azureAdB2CPolicyName() {
    return this.getEnv("AZURE_AD_B2C_POLICY_NAME");
  }

  static azureAdB2cClientId() {
    return this.getEnv("AZURE_AD_B2C_CLIENT_ID");
  }

  static azureIdentityInstance() {
    return this.getEnv("AZURE_IDENTITY_INSTANCE");
  }

  static azureIdentityMetadataUrl() {
    return this.getEnv("AZURE_IDENTITY_METADATA_URL");
  }

  static azureIdentityDomain() {
    return this.getEnv("AZURE_IDENTITY_DOMAIN");
  }
}

module.exports = EnvironmentService;
