const axios = require("axios");
const EnvironmentService = require("../../shared/environment.service");

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
      baseURL: EnvironmentService.RB209_BASE_URL(),
    });

    this.#request.interceptors.request.use(
      async (config) => {
        if (
          config.url === "/Users/Login" ||
          config.url === "/Users/Refresh_Token"
        ) {
          return config;
        }
        let accessToken = await this.#cacheManager.get(this.#accessTokenKey);
        const refreshToken = await this.#cacheManager.get(
          this.#refreshTokenKey
        );
        let tokens;
        if (!accessToken) {
          if (!refreshToken) {
            tokens = (await this.login()).data;
          } else {
            tokens = await this.refreshAccessToken();
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
        if (error.config.url === "/Users/Login") {
          return Promise.reject(error);
        } else if (error.config.url === "/Users/Refresh_Token") {
          return await this.login();
        } else if (
          error.response &&
          error.response.status === 401 &&
          !error.config._retryRequest
        ) {
          const tokens = await this.refreshAccessToken();
          this.updateTokens(tokens);
          return await this.#request({ ...error.config, _retryRequest: true });
        }
        return Promise.reject(error);
      }
    );
  }

  async updateTokens(tokens) {
    await this.#cacheManager.set(this.#accessTokenKey, tokens.accessToken, {
      ttl: 60 * 50,
    });
    await this.#cacheManager.set(this.#refreshTokenKey, tokens.refreshToken, {
      ttl: 60 * 60 * 24 * 24,
    });
  }

  async login() {
    const response = await this.#request.post("/Users/Login", {
      email: EnvironmentService.RB209_USER_EMAIL(),
      password: EnvironmentService.RB209_USER_PASSWORD(),
    });
    return response;
  }

  async refreshAccessToken() {
    const response = await this.#request.post("/Users/Refresh_Token", {
      email: EnvironmentService.RB209_USER_EMAIL(),
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
