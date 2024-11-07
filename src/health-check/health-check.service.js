const AddressLookupService = require("../vendors/address-lookup/address-lookup.service");
const RB209BaseService = require("../vendors/rb209/base.service");
const { AppDataSource } = require("../db/data-source");

class HealthCheckService {
  constructor() {
    this.dataSource = AppDataSource;
    this.rb209Service = new RB209BaseService();
    this.addressLookupService = new AddressLookupService();
  }

  async checkDatabaseHealth() {
    try {
      if (this.dataSource.isInitialized) {
        return { message: "NMP API is working" };
      }
    } catch (error) {
      console.error("Database connection error:", error);
      return {
        errorMessage: error.message,
        code: error.code,
      };
    }
  }

  async checkRB209Health() {
    try {
      // Call the login method
      const loginResponse = await this.rb209Service.login();
      return { message: "RB209 API is Working" };
    } catch (error) {
      console.error("RB209 API is not working:", error);
      return {
        errorMessage: error.message,
        code: error.code,
      };
    }
  }

  async checkAddressLookupHealth() {
    try {
      // Attempt to fetch some data to ensure the service is responsive
      await this.addressLookupService.getAddressesByPostCode("EC1A 1BB"); // Or any other valid postcode
      return { message: "Address Lookup is working" };
    } catch (error) {
      console.error("Address Lookup is not working:", error);
      return {
        errorMessage: error.message,
        code: error.code,
      };
    }
  }
}

module.exports = { HealthCheckService };
