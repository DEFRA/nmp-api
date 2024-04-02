import { Injectable } from '@nestjs/common';
import * as request from 'superagent';

@Injectable()
export class RB209Service {
  async check(): Promise<any> {
    return 'Connected!';
  }

  async get(): Promise<any> {
    const response = await request.get('https://fakestoreapi.com/products');
    return response.body;
  }
}
