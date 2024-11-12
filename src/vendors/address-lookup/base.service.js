const axios = require("axios");
const EnvironmentService = require("../../shared/environment.service");

class AddressLookupBaseService {
  #accessTokenKey;
  #cacheManager;
  #request;

  constructor(cacheManager) {
    this.#cacheManager = cacheManager;
    this.#accessTokenKey = "address-lookup-access-token";

    // Create axios instance for making API requests
    this.#request = axios.create({
      baseURL: EnvironmentService.ADDR_LOOKUP_BASE_URL(),
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
          error.response &&
          error.response.status === 401 &&
          !error.config._retryRequest
        ) {
          const accessToken = await this.fetchAccessToken();
          this.updateAccessToken(accessToken);
          return await this.#request({ ...error.config, _retryRequest: true });
        }
        return Promise.reject(error);
      }
    );
  }

    async fetchAccessToken() {
      const tokenUrl = `https://login.microsoftonline.com/${EnvironmentService.ADDR_TENANT_ID()}/oauth2/v2.0/token`;
      const requestBody = `grant_type=client_credentials&scope=${
        EnvironmentService.ADDR_SCOPE()
      }&client_id=${
        EnvironmentService.ADDR_CLIENT_ID()
      }&client_secret=${
        EnvironmentService.ADDR_CLIENT_SECRET()
      }`;
     
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
