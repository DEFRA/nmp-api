const axios = require("axios");
const http = require("node:http");
const https = require("node:https");
const EnvironmentService = require("../../shared/environment.service");
const {
  StatusCodeMapper,
} = require("../../constants/http-status-codes-mapper");
const {
  getPositiveIntFromEnv,
  runResilientOperation,
  isRetryableHttpError,
} = require("../../shared/resilience-guard.service");
const { logRb209ApiError } = require("./rb209-error-logger.service");
const userLoginUrl = "/Users/Login";
const refreshAccessTokenUrl = "/Users/Refresh_Token";
const RECOMMENDATION_ENDPOINT = "Recommendation/Recommendations";
const DEFAULT_TIMEOUT_MS = 120000;
const DEFAULT_RECOMMENDATION_TIMEOUT_MS = 300000;
const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_RETRY_BASE_DELAY_MS = 800;
const DEFAULT_MAX_CONCURRENT_REQUESTS = 3;
const DEFAULT_CIRCUIT_FAILURE_THRESHOLD = 5;
const DEFAULT_CIRCUIT_COOLDOWN_MS = 30000;
const MAX_ERROR_REQUEST_LOG_CHARS = 4000;
const DEFAULT_MAX_REQUEST_BYTES = 2 * 1024 * 1024;

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
      timeout: getPositiveIntFromEnv(
        "RB209_REQUEST_TIMEOUT_MS",
        DEFAULT_TIMEOUT_MS,
      ),
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      httpAgent: new http.Agent({
        keepAlive: true,
      }),
      httpsAgent: new https.Agent({
        keepAlive: true,
      }),
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
          this.#refreshTokenKey,
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
      (error) => Promise.reject(error),
    );

    this.#request.interceptors.response.use(
      (response) => response,
      async (error) => {
        const requestUrl = error?.config?.url;
        if (!requestUrl) {
          throw error;
        } else if (requestUrl === userLoginUrl) {
          throw error;
        } else if (requestUrl === refreshAccessTokenUrl) {
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
          throw error;
        }
      },
    );
  }

  #resolveTimeoutMs(url) {
    const recommendationTimeoutMs = getPositiveIntFromEnv(
      "RB209_RECOMMENDATION_TIMEOUT_MS",
      DEFAULT_RECOMMENDATION_TIMEOUT_MS,
    );
    const defaultTimeoutMs = getPositiveIntFromEnv(
      "RB209_REQUEST_TIMEOUT_MS",
      DEFAULT_TIMEOUT_MS,
    );

    if (typeof url === "string" && url.includes(RECOMMENDATION_ENDPOINT)) {
      return recommendationTimeoutMs;
    }

    return defaultTimeoutMs;
  }

  #buildCircuitOpenErrorResponse(waitMs = 0) {
    return {
      request: null,
      status: StatusCodeMapper.INTERNAL_SERVER_ERROR,
      data: {
        error: "RB209 circuit breaker is open",
        retryAfterMs: waitMs,
      },
      statusText: "Service Unavailable",
      message: "RB209 requests paused after repeated transient failures",
      stack: "N/A",
    };
  }

  #buildPayloadTooLargeResponse(actualBytes, limitBytes) {
    return {
      request: null,
      status: 413,
      data: {
        error: "RB209 payload too large",
        payloadBytes: actualBytes,
        limitBytes,
      },
      statusText: "Payload Too Large",
      message: "RB209 request blocked by payload-size guard",
      stack: "N/A",
    };
  }

  #getPayloadSizeBytes(body) {
    try {
      return Buffer.byteLength(JSON.stringify(body ?? {}), "utf8");
    } catch (error) {
      console.error("Unable to calculate RB209 payload size:", error?.message);
      return Number.MAX_SAFE_INTEGER;
    }
  }

  #truncateValueForLog(value) {
    if (typeof value !== "string") {
      return value;
    }

    if (value.length <= MAX_ERROR_REQUEST_LOG_CHARS) {
      return value;
    }

    return `${value.slice(0, MAX_ERROR_REQUEST_LOG_CHARS)}...[truncated]`;
  }

  async #runRb209Request(requestFactory) {
    return runResilientOperation({
      key: "rb209-http",
      operation: requestFactory,
      retries: getPositiveIntFromEnv(
        "RB209_RETRY_ATTEMPTS",
        DEFAULT_MAX_RETRIES,
      ),
      retryBaseDelayMs: getPositiveIntFromEnv(
        "RB209_RETRY_BASE_DELAY_MS",
        DEFAULT_RETRY_BASE_DELAY_MS,
      ),
      shouldRetry: isRetryableHttpError,
      maxConcurrency: getPositiveIntFromEnv(
        "RB209_MAX_CONCURRENT_REQUESTS",
        DEFAULT_MAX_CONCURRENT_REQUESTS,
      ),
      failureThreshold: getPositiveIntFromEnv(
        "RB209_CIRCUIT_FAILURE_THRESHOLD",
        DEFAULT_CIRCUIT_FAILURE_THRESHOLD,
      ),
      cooldownMs: getPositiveIntFromEnv(
        "RB209_CIRCUIT_COOLDOWN_MS",
        DEFAULT_CIRCUIT_COOLDOWN_MS,
      ),
    });
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
    const startedAt = Date.now();
    try {
      const timeoutMs = this.#resolveTimeoutMs(url);
      const response = await this.#runRb209Request(() =>
        this.#request.get(url, { timeout: timeoutMs }),
      );
      return response.data;
    } catch (error) {
      if (error?.code === "CIRCUIT_OPEN") {
        return this.#buildCircuitOpenErrorResponse(error.retryAfterMs);
      }

      logRb209ApiError({
        method: "GET",
        endpoint: url,
        startedAt,
        error,
      });
      return error.response;
    }
  }

  async postData(url, body) {
    const startedAt = Date.now();
    try {
      const maxRequestBytes = getPositiveIntFromEnv(
        "RB209_MAX_REQUEST_BYTES",
        DEFAULT_MAX_REQUEST_BYTES,
      );
      const payloadSizeBytes = this.#getPayloadSizeBytes(body);

      if (payloadSizeBytes > maxRequestBytes) {
        return this.#buildPayloadTooLargeResponse(
          payloadSizeBytes,
          maxRequestBytes,
        );
      }

      const timeoutMs = this.#resolveTimeoutMs(url);
      const response = await this.#runRb209Request(() =>
        this.#request.post(url, body, { timeout: timeoutMs }),
      );

      return {
        request: this.#truncateValueForLog(response.config.data),
        status: response.status,
        data: response.data,
        statusText: response.statusText,
        message: response.message || "API call successful",
      };
    } catch (error) {
      if (error?.code === "CIRCUIT_OPEN") {
        return this.#buildCircuitOpenErrorResponse(error.retryAfterMs);
      }

      logRb209ApiError({
        method: "POST",
        endpoint: url,
        requestPayload: body,
        startedAt,
        error,
      });
      return {
        request: this.#truncateValueForLog(error.config?.data ?? null),
        status:
          error.response?.status ?? StatusCodeMapper.INTERNAL_SERVER_ERROR,
        data: error.response?.data ?? error.message,
        statusText: error.response?.statusText ?? "Internal Server Error",
        message: error.message || "API call failed",
        stack: error.stack || "N/A",
      };
    }
  }
}

module.exports = RB209BaseService;
