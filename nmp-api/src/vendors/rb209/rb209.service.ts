import { HttpStatus, Injectable } from '@nestjs/common';
import EnvironmentService from '@shared/environment.service';
import axios, { AxiosInstance } from 'axios';
import { RB209UsersDto } from './dto/rb209-users.dto';

@Injectable()
export class RB209Service {
  private readonly request: AxiosInstance;

  constructor() {
    this.request = axios.create({
      baseURL: EnvironmentService.RB209_BASE_URL(),
    });
  }

  async check(): Promise<any> {
    return 'Connected!';
  }

  async getSoilTypes(): Promise<any> {
    const response = await this.request.get('/Soil/SoilTypes');
    return response.data;
  }
}
