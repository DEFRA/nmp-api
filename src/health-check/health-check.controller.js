const { HealthCheckService } = require("./health-check.service");

class HealthCheckController {
  #h;
  #healthCheckService;

  constructor(h) {
    this.#h = h;
    this.#healthCheckService = new HealthCheckService();
  }
  async checkAPIHealth() {
    try {
      const dbHealth = await this.#healthCheckService.checkDatabaseHealth();
      return this.#h.response({
        nmp_api: dbHealth,
    
      });
    } catch (error) {
      console.error("Error during health check:", error);
      return this.#h.response({ error });
    }
  }
}

module.exports = { HealthCheckController };
