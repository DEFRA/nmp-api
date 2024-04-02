import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
@Injectable()
export class AppService {
  constructor(private readonly connection: Connection) {}
  async health(): Promise<any> {
    try {
      return {
        isConnected: this.connection.isConnected,
        driver: {
          version: this.connection.driver.version,
        },
      };
    } catch (error) {
      console.error('Error connecting to database:', error);
      return false;
    }
  }
}
