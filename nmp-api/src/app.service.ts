import { Injectable } from '@nestjs/common';
import {  DataSource } from 'typeorm';
import { RB209BaseService } from './vendors/rb209/base.service';
import { AddressLookupService } from './vendors/address-lookup/address-lookup.service';


@Injectable()
export class AppService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly rb209Service: RB209BaseService,
    private readonly addressLookupService: AddressLookupService,
  ) {}

  async health(): Promise<any> {
    try {
      const dbHealth = {
        isConnected: this.dataSource.isInitialized,
        message: 'Database Health Check Successful',
        driver: {
          driver: await this.getDatabaseVersion(),
        },
      };

      const rb209Health = await this.checkRB209Health();
      const addressLookupHealth = await this.checkAddressLookupHealth();

      return {
        database: dbHealth,
        rb209: rb209Health,
        addressLookup: addressLookupHealth,
      };
    } catch (error) {
      console.error('Error during health check:', error);
      return { status: 'Health check failed', error: error.message };
    }
  }

  private async getDatabaseVersion(): Promise<{ version: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    let version: string;

    try {
      const result = await queryRunner.query('SELECT @@version as version');
      console.log("result",result)
      version = result[0]?.version || 'Unknown';
    } finally {
      await queryRunner.release();
    }

    return { version };
  }

  private async checkRB209Health(): Promise<any> {
    try {
      const rb209Status = await this.rb209Service.check();
      return { isConnected: true, message: rb209Status };
    } catch (error) {
      console.error('RB209 API health check failed:', error);
      return { isConnected: false, message: 'RB209 API Health Check Failed' };
    }
  }

  private async checkAddressLookupHealth(): Promise<any> {
    try {
      const addressLookupStatus = await this.addressLookupService.check();
      return { isConnected: true, message: addressLookupStatus };
    } catch (error) {
      console.error('Address Lookup API health check failed:', error);
      return {
        isConnected: false,
        message: 'Address Lookup API Health Check Failed',
      };
    }
  }
}
