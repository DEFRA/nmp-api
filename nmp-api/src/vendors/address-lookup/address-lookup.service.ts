import { Injectable } from '@nestjs/common';
import EnvironmentService from '@shared/environment.service';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class AddressLookupService {
  private readonly request: AxiosInstance;

  constructor() {
    console.log(EnvironmentService.ADDR_LOOKUP_API_KEY());

    this.request = axios.create({
      baseURL: EnvironmentService.ADDR_LOOKUP_BASE_URL(),
      headers: {
        'Ocp-Apim-Subscription-Key': EnvironmentService.ADDR_LOOKUP_API_KEY(),
      },
    });
  }

  async check(): Promise<any> {
    return 'Connected!';
  }

  async getAddressesByPostCode(postcode: string): Promise<any> {
    const response = await this.request.get(`/addresses?postcode=${postcode}`);
    return response.data;
  }
}
