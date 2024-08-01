import { Injectable } from '@nestjs/common';
import EnvironmentService from '@shared/environment.service';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class AddressLookupService {
  private readonly request: AxiosInstance;

  constructor() {
    this.request = axios.create({
      baseURL: EnvironmentService.ADDR_LOOKUP_BASE_URL(),
      headers: {
        'Ocp-Apim-Subscription-Key':
          EnvironmentService.ADDR_LOOKUP_SUBSCRIPTION_KEY(),
      },
    });
  }

  async check(): Promise<any> {
    return 'Connected!';
  }

  async getAddressesByPostCode(
    postcode: string,
    offset: number = 0,
  ): Promise<any> {
    const response = await this.request.get(
      `/addresses?postcode=${postcode}&offset=${offset}`,
    );
    return response.data;
  }
}
