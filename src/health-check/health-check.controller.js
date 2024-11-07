const { HealthCheckService } = require("./health-check.service");

class HealthCheckController {
  #request;
  #h;
  #healthCheckService;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#healthCheckService = new HealthCheckService();
  }
  async checkAPIHealth() {
    try {
      const dbHealth = await this.#healthCheckService.checkDatabaseHealth();
      // const rb209Health = await this.#healthCheckService.checkRB209Health();
      // const addressLookupHealth =
      //   await this.#healthCheckService.checkAddressLookupHealth();
      return this.#h.response({
        nmp_api: dbHealth,
        // rb209_api: rb209Health,
        // addressLookup_api: addressLookupHealth,
      });
    } catch (error) {
      console.error("Error during health check:", error);
      return this.#h.response({ error });
    }
  }
}

module.exports = { HealthCheckController };
