import { HttpStatus, Inject } from '@nestjs/common';
import EnvironmentService from '@shared/environment.service';
import axios, { AxiosInstance } from 'axios';
import { Cache } from 'cache-manager';
import * as https from 'https';

export class MannerBaseService {
  protected readonly request: AxiosInstance;
  constructor(
    protected readonly cacheManager: Cache,
    protected readonly req?: Request,
  ) {
    this.request = axios.create({
      baseURL: EnvironmentService.MANNER_BASE_URL(),
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    });

    this.request.interceptors.request.use(
      async (config) => {
        // Retrieve the access token from the cache
        const token=this.req.headers['authorization']
        // If the access token exists, add it to the Authorization header

        config.headers['Authorization'] = `${token}`;

        return config;
      },
      (error) => Promise.reject(error),
    );

  }
 

  async getData(endpoint: string): Promise<any> {
    try {
      const response = await this.request.get(endpoint);
      return response.data;
    } catch (error) {
      return error.response;
    }
  }

  async postData(url: string, body: any): Promise<any> {
    try {
      const response = await this.request.post(url, body);
      return response.data;
    } catch (error) {
      return error.response.data;
    }
  }
}
