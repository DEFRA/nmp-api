import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
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
      const dbHealth = await this.checkDatabaseHealth();
      // const rb209Health = await this.checkRB209Health();
      // const addressLookupHealth = await this.checkAddressLookupHealth();

      return {
        nmp_api: dbHealth,
        // rb209_api: rb209Health,
        // addressLookup_api: addressLookupHealth,
      };
    } catch (error) {
      console.error('Error during health check:', error);
      return { status: 'Error during health check:', error: error.message };
    }
  }

  private async checkDatabaseHealth(): Promise<any> {
    try {
      if (this.dataSource.isInitialized) {
        return { message: 'NMP API is working' };
      } 
    } catch (error) {
      console.error('Database connection error:', error);
      return {
      errorMessage:error
      };
    }
  }

  private async checkRB209Health(): Promise<any> {
    try {
      // Call the login method
      const loginResponse = await this.rb209Service.login();
      return {
        message: 'RB209 API is Working',
      };
    } catch (error) {
      console.error('RB209 API is not working:', error);
      return {
        errorMessage: error.message,
        code: error.code,
      };
    }
  }

  private async checkAddressLookupHealth(): Promise<any> {
    try {
      // Attempt to fetch some data to ensure the service is responsive
      await this.addressLookupService.getAddressesByPostCode('EC1A 1BB'); // Or any other valid postcode
      return { message: 'Address Lookup is working' };
    } catch (error) {
      console.error('Address Lookup is not working',error);
      return {
        errorMessage: error.message,
        code: error.code,
      };
    }
  }
}
