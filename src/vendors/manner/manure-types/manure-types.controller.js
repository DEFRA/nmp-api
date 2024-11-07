const MannerManureTypesService = require("./manure-types.service");

class MannerManureTypesController {
  #request;
  #h;
  #service;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#service = new MannerManureTypesService();
  }

  async getAllManureTypes() {
    const {
      manureGroupId,
      manureTypeCategoryId,
      countryId,
      highReadilyAvailableNitrogen,
      isLiquid,
    } = this.#request.query;

    // Initialize the endpoint base
    let endpoint = this.#request.url.pathname.split("/manner")[1];

    // Initialize an array to hold the query string parts
    const queryParams = [];

    // Add query parameters conditionally
    if (manureGroupId) queryParams.push(`manureGroupId=${manureGroupId}`);
    if (manureTypeCategoryId)
      queryParams.push(`manureTypeCategoryId=${manureTypeCategoryId}`);
    if (countryId) queryParams.push(`countryId=${countryId}`);

    // Since highReadilyAvailableNitrogen and isLiquid are booleans, check against undefined to ensure both true/false are handled
    if (highReadilyAvailableNitrogen !== undefined)
      queryParams.push(
        `highReadilyAvailableNitrogen=${highReadilyAvailableNitrogen}`
      );
    if (isLiquid !== undefined) queryParams.push(`isLiquid=${isLiquid}`);

    // If there are query parameters, join them with "&" and append to the endpoint
    if (queryParams.length > 0) {
      endpoint += `?${queryParams.join("&")}`;
    }

    // Fetch data using the constructed endpoint
    const data = await this.#service.getData(endpoint, this.#request);

    // Return the response with the data
    return this.#h.response(data);
  }

  async getManureTypesById() {
    const { id } = this.#request.params;
    const url = this.#request.url.pathname.split("/manner")[1];
    const data = await this.#service.getData(url, this.#request);
    return this.#h.response(data);
  }
}
module.exports = MannerManureTypesController;