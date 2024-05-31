import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import EnvironmentService from '@shared/environment.service';
import axios, { AxiosInstance } from 'axios';
import { Cache } from 'cache-manager';

export class AzureAuthService {
  private issuerUrlKey = 'azure-ad-b2c-issuer-url';
  private jwksUriKey = 'azure-ad-b2c-jwks-uri';
  protected readonly request: AxiosInstance;

  constructor(@Inject(CACHE_MANAGER) protected readonly cacheManager: Cache) {
    this.request = axios.create({
      baseURL: EnvironmentService.AZURE_IDENTITY_INSTANCE(),
    });
  }

  private async getDataFromCache() {
    const issuerUrl = await this.cacheManager.get(this.issuerUrlKey);
    const jwksUri = await this.cacheManager.get(this.jwksUriKey);
    if (issuerUrl && jwksUri)
      return {
        issuerUrl,
        jwksUri,
      };
    return {};
  }

  private async setDataInCache(issuerUrl: string, jwksUrl: string) {
    const cacheTime = 24 * 24 * 60 * 60 * 1000; // 24 days
    await this.cacheManager.set(this.issuerUrlKey, issuerUrl, cacheTime);
    await this.cacheManager.set(this.jwksUriKey, jwksUrl, cacheTime);
  }

  async getData(url?: string): Promise<any> {
    try {
      const data = await this.getDataFromCache();
      if (data?.issuerUrl && data?.jwksUri) return data;
      const response = await this.request.get(url);
      await this.setDataInCache(
        response?.data?.issuer,
        response?.data?.jwks_uri,
      );
      return {
        issuerUrl: response?.data?.issuer,
        jwksUri: response?.data?.jwks_uri,
      };
    } catch (error) {
      return error.response.data;
    }
  }
}
