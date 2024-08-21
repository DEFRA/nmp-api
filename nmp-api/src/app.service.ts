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
        message: 'NMP API is working',
      };

      const rb209Health = await this.checkRB209Health();
      const addressLookupHealth = await this.checkHealth();

      return {
        database: dbHealth,
        rb209: rb209Health,
        addressLookup: addressLookupHealth,
      };
    } catch (error) {
      console.error('Error during health check:', error);
      return { status: 'NMP Api is not working', error: error.message };
    }
  }

  

  private async checkRB209Health(): Promise<any> {
    try {
      // Call the login method 
      const loginResponse = await this.rb209Service.login();
      return { isConnected: true, message: 'RB209 API is Working' };
    } catch (error) {
      console.error('RB209 API is not working:', error);
      return { isConnected: false, message: 'RB209 API is not working' };
    }
  }

  async checkHealth(): Promise<any> {
    try {
      // Attempt to fetch some data to ensure the service is responsive
      await this.addressLookupService.getAddressesByPostCode('EC1A 1BB'); // Or any other valid postcode
      return {
        isConnected: true,
        message: 'Address Lookup is working',
      };
    } catch (error) {
      return {
        isConnected: false,
        message: 'Address Lookup is not working',
      };
    }
  }
}
