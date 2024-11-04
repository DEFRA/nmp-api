const MannerRainfallPostApplicationService = require("./rainfall-post-application.service");

class MannerRainfallPostApplicationController {
  #request;
  #h;
  #service;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#service = new MannerRainfallPostApplicationService(); // Initialize the service
  }

  async calculateRainfallPostApplicationOfManure() {
    const payload = this.#request.payload;

    // Extract the relevant part of the URL
    const url = this.#request.url.pathname.split("/manner")[1];

    // Call the service method to handle the nutrient calculation
    return await this.#service.postData(url, payload, this.#request);
  }
}

module.exports = MannerRainfallPostApplicationController;
