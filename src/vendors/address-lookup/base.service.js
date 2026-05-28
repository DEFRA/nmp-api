const axios = require("axios");
const EnvironmentService = require("../../shared/environment.service");
const { StatusCodeMapper } = require("../../constants/http-status-codes-mapper");

class AddressLookupBaseService {
  #accessTokenKey;
  #cacheManager;
  #request;

  constructor(cacheManager) {
    this.#cacheManager = cacheManager;
    this.#accessTokenKey = "address-lookup-access-token";

    // Create axios instance for making API requests
    this.#request = axios.create({
      baseURL: EnvironmentService.addrLookupBaseUrl(),
    });

    // Add request interceptor to handle token management
    this.#request.interceptors.request.use(
      async (config) => {
        let accessToken = await this.#cacheManager.get(this.#accessTokenKey);
        if (!accessToken) {
          accessToken = await this.fetchAccessToken();
       
          this.updateAccessToken(accessToken);
        }
        config.headers["Authorization"] = `Bearer ${accessToken}`;
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.#request.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (
          error.response?.status === StatusCodeMapper.UNAUTHORIZED &&
          !error.config._retryRequest
        ) {
          const accessToken = await this.fetchAccessToken();
          this.updateAccessToken(accessToken);
          return await this.#request({ ...error.config, _retryRequest: true });
        }
        throw error;
      }
    );
  }

    async fetchAccessToken() {
      const tokenUrl = `https://login.microsoftonline.com/${EnvironmentService.addrTenantId()}/oauth2/v2.0/token`;
      const requestBody = `grant_type=client_credentials&scope=${EnvironmentService.addrScope()}&client_id=${EnvironmentService.addrClientId()}&client_secret=${EnvironmentService.addrClientSecret()}`;
      try {
        const response = await axios.post(tokenUrl, requestBody, {
        headers: {
           "Content-Type": "application/x-www-form-urlencoded",
        },
       });
    
        return response.data.access_token;
      } catch (error) {
        console.error(`Failed to fetch access token: ${error.message}`);
      }
    }      

  // Cache the access token
  async updateAccessToken(accessToken) {
    await this.#cacheManager.set(this.#accessTokenKey, accessToken, {
      ttl: 60 * 50, // Cache for 50 minutes
    });
  }

  // Get data from address lookup API
  async getData(url) {
    try {
      const response = await this.#request.get(url);
      return response.data;
    } catch (error) {
      return error.response;
    }
  }

  // Post data to address lookup API
  async postData(url, body) {
    try {
      const response = await this.#request.post(url, body);
      return response.data;
    } catch (error) {
      return error.response;
    }
  }
}

module.exports = AddressLookupBaseService;
