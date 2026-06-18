const { StorageTypesService } = require("./storage-types.service");

class StorageTypesController {
  #request;
  #h;
  #storageTypesService;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#storageTypesService = new StorageTypesService();
  }

  async getAll() {
    try {
      const records = await this.#storageTypesService.getAll();
      return this.#h.response( records );
    } catch (error) {
      console.error("Error in getAll:", error);
      return this.#h.response( error );
    }
  }

  async getById() {
    const { id } = this.#request.params;
    try {
      const record = await this.#storageTypesService.getById(id);
      return this.#h.response( record );
    } catch (error) {
      console.error("Error in getById:", error);
      return this.#h.response( error );
    }
  }

  
}

module.exports = { StorageTypesController };
