import { HttpStatus } from '@nestjs/common';
import EnvironmentService from '@shared/environment.service';
import axios, { AxiosInstance } from 'axios';
import { RB209UsersDto } from './dto/rb209-users.dto';
import { Cache } from 'cache-manager';

export class RB209BaseService {
  private accessTokenKey = 'rb209-access-token';
  private refreshTokenKey = 'rb209-refresh-token';
  protected readonly request: AxiosInstance;

  constructor(protected readonly cacheManager: Cache) {
    this.request = axios.create({
      baseURL: EnvironmentService.RB209_BASE_URL(),
    });

    this.request.interceptors.request.use(
      async (config) => {
        if (
          config.url === '/Users/Login' ||
          config.url === '/Users/Refresh_Token'
        )
          return config;

        let accessToken = await this.cacheManager.get(this.accessTokenKey);
        const refreshToken = await this.cacheManager.get(this.refreshTokenKey);
        let tokens: RB209UsersDto;
        if (!accessToken) {
          if (!refreshToken) {
            tokens = (await this.login()).data;
          } else {
            tokens = await this.refreshAccessToken();
          }
          accessToken = tokens.accessToken;
          this.updateTokens(tokens);
        }
        config.headers.set('Authorization', `Bearer ${accessToken}`);
        return config;
      },
      (error) => Promise.reject(error),
    );

    this.request.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.config.url === '/Users/Login') {
          return Promise.reject(error);
        } else if (error.config.url === '/Users/Refresh_Token') {
          return await this.login();
        } else if (
          error.response.status === HttpStatus.UNAUTHORIZED &&
          !error.config._retryRequest
        ) {
          const tokens = await this.refreshAccessToken();
          this.updateTokens(tokens);
          return await this.request({ ...error.config, _retryRequest: true });
        }
        return Promise.reject(error);
      },
    );
  }

  private async updateTokens(tokens: RB209UsersDto) {
    await this.cacheManager.set(
      this.accessTokenKey,
      tokens.accessToken,
      60 * 50 * 1000, // 50 minutes expiry
    );
    await this.cacheManager.set(
      this.refreshTokenKey,
      tokens.refreshToken,
      60 * 60 * 24 * 24 * 1000, // 24 days expiry
    );
  }

  private async login() {
    const response = await this.request.post<RB209UsersDto>('/Users/Login', {
      email: EnvironmentService.RB209_USER_EMAIL(),
      password: EnvironmentService.RB209_USER_PASSWORD(),
    });
    return response;
  }

  private async refreshAccessToken(): Promise<RB209UsersDto> {
    const response = await this.request.post(`/Users/Refresh_Token`, {
      email: EnvironmentService.RB209_USER_EMAIL(),
      refreshToken: await this.cacheManager.get(this.refreshTokenKey),
    });
    return response.data;
  }

  async check(): Promise<any> {
    return 'Connected!';
  }
}
