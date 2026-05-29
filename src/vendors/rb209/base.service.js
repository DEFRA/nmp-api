const axios = require("axios");
const EnvironmentService = require("../../shared/environment.service");
const { StatusCodeMapper } = require("../../constants/http-status-codes-mapper");
const userLoginUrl = "/Users/Login";
const refreshAccessTokenUrl = "/Users/Refresh_Token";
class RB209BaseService {
  #cacheManager;
  #accessTokenKey;
  #refreshTokenKey;
  #request;

  constructor(cacheManager) {
    this.#cacheManager = cacheManager;
    this.#accessTokenKey = "rb209-access-token";
    this.#refreshTokenKey = "rb209-refresh-token";

    this.#request = axios.create({
      baseURL: EnvironmentService.rb209BaseUrl(),
    });
    this.#request.interceptors.request.use(
      async (config) => {
        if (
          config.url === userLoginUrl ||
          config.url === refreshAccessTokenUrl
        ) {
          return config;
        }
        let accessToken = await this.#cacheManager.get(this.#accessTokenKey);
        const refreshToken = await this.#cacheManager.get(
          this.#refreshTokenKey
        );
        let tokens;
        if (!accessToken) {
          if (refreshToken) {
            tokens = await this.refreshAccessToken();
          } else {
            tokens = (await this.login()).data;
          }
          accessToken = tokens.accessToken;
          this.updateTokens(tokens);
        }
        config.headers["Authorization"] = `Bearer ${accessToken}`;
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.#request.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.config.url === userLoginUrl) {
          throw error;
        } else if (error.config.url === refreshAccessTokenUrl) {
          const loginResponse = await this.login();
          return loginResponse;
        } else if (
          error.response?.status === StatusCodeMapper.UNAUTHORIZED &&
          !error.config._retryRequest
        ) {
          const tokens = await this.refreshAccessToken();
          this.updateTokens(tokens);
          const retryRequest = this.#request({
            ...error.config,
            _retryRequest: true,
          });
          return retryRequest;
        } else {
          console.log("Request not matching");
        }
        throw error;
      }
    );
  }

  async updateTokens(tokens) {
    const accesTokenMinutes = 50;
    await this.#cacheManager.set(this.#accessTokenKey, tokens.accessToken, {
      ttl: 60 * accesTokenMinutes,
    });
    await this.#cacheManager.set(this.#refreshTokenKey, tokens.refreshToken, {
      ttl: 60 * 60 * 24 * 24,
    });
  }

  async login() {
    const response = await this.#request.post(userLoginUrl, {
      email: EnvironmentService.rb209UserEmail(),
      password: EnvironmentService.rb209UserPassword(),
    });
    return response;
  }

  async refreshAccessToken() {
    const response = await this.#request.post(refreshAccessTokenUrl, {
      email: EnvironmentService.rb209UserEmail(),
      refreshToken: await this.#cacheManager.get(this.#refreshTokenKey),
    });
    return response.data;
  }

  async check() {
    return "Connected!";
  }

  async getData(url) {
    try {
      const response = await this.#request.get(url);

      return response.data;
    } catch (error) {
      return error.response;
    }
  }

  async postData(url, body) {
    try {
      const response = await this.#request.post(url, body);
      return response.data;
    } catch (error) {
      return error.response;
    }
  }
}

module.exports = RB209BaseService;
