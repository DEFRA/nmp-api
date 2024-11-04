const axios = require("axios");
const boom = require("@hapi/boom");

const EnvironmentService = require("../shared/environment.service");

class AzureAuthService {
  #issuerUrl;
  #jwksUri;
  #request;

  constructor() {
    this.#request = axios.create({
      baseURL: EnvironmentService.AZURE_IDENTITY_INSTANCE(),
    });
  }

  async getData(url) {
    try {
      if (this.#issuerUrl && this.#jwksUri)
        return {
          issuerUrl: this.#issuerUrl,
          jwksUri: this.#jwksUri,
        };
      const response = await this.#request.get(url);
      this.#issuerUrl = response?.data?.issuer;
      this.#jwksUri = response?.data?.jwks_uri;
      return {
        issuerUrl: this.#issuerUrl,
        jwksUri: this.#jwksUri,
      };
    } catch (error) {
      throw boom.unauthorized(
        `Failed to get configuration - ${error?.message}`
      );
    }
  }
}

module.exports = { AzureAuthService };
