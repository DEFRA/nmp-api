const RB209PreviousCroppingService = require("./previousCropping.service");
class RB209PreviousCroppingController {
  #request;
  #h;
  #service;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#service = new RB209PreviousCroppingService();
  }
  async getPreviousGrasses() {
    const url = this.#request.url.pathname.split("/rb209")[1];
    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getPreviousGrassByPreviousGrassId() {
    const { previousGrassId } = this.#request.params;
    console.log("Previous GrassId ID:", previousGrassId);

    const url = this.#request.url.pathname.split("/rb209")[1];
    try {
      const data = await this.#service.getData(url);
      return this.#h.response(data);
    } catch (error) {
      return this.#h.response({ error });
    }
  }
}

module.exports = { RB209PreviousCroppingController };
