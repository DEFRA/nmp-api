const AddressLookupService = require("./address-lookup.service");

class AddressLookupController {
  #request;
  #h;
  #service;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#service = new AddressLookupService();
  }

  async health() {
    try {
      const data = await this.#service.check();
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getAddresses() {
    const { postcode } = this.#request.query;
    const { offset } = this.#request.query;
    try {
      const data = await this.#service.getAddressesByPostCode(postcode, offset);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }
}

module.exports = { AddressLookupController };
