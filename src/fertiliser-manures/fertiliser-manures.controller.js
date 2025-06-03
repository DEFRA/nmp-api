const { FertiliserManuresService } = require('./fertiliser-manures.service');

class FertiliserManuresController {
  #request;
  #h;
  #fertiliserManuresService;

  constructor(request, h) {
    this.#request = request;
    this.#h = h;
    this.#fertiliserManuresService = new FertiliserManuresService();
  }

  async getFertiliserManureNitrogenSum() {
    const { fieldId } = this.#request.params;
    const { fromDate, toDate, confirm,fertiliserId, } = this.#request.query;

    try {
      const totalN =
        await this.#fertiliserManuresService.getFertiliserManureNitrogenSum(
          fieldId,
          fromDate,
          toDate,
          confirm,
          fertiliserId
        );
      return this.#h.response({ TotalN: totalN });
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getTotalNitrogen() {
    const { fieldId } = this.#request.params;
    const { confirm,fertiliserID,organicManureID } = this.#request.query;
    try {
      const totalN = await this.#fertiliserManuresService.getTotalNitrogen(
        fieldId,
        confirm,
        fertiliserID,
        organicManureID
      );
      return this.#h.response({ TotalN: totalN });
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async createFertiliserManure() {
    const fertiliserManureBody = this.#request.payload.FertiliserManure;
    const userId = this.#request.userId;
    try {
      const data = await this.#fertiliserManuresService.createFertiliserManures(
        fertiliserManureBody,
        userId,
        this.#request
      );
      return this.#h.response({ FertiliserManure: data });
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  

  async updateFertiliser() {
    const { fertiliserId } = this.#request.params;
    const updatedFertiliserManureData = this.#request.payload.FertiliserManure; // Extract the array from payload
    const userId = this.#request.userId;

    console.log("updatedFertiliserManureData", updatedFertiliserManureData);

    try {
      // const results = []; // Array to store the results for each manure item
      // for (const manure of updatedFertiliserManureData) {
      // Process each manure object
      const data = await this.#fertiliserManuresService.updateFertiliser(
        updatedFertiliserManureData, // Pass the current manure object
        userId, // User ID
        // parseInt(fertiliserId), // Fertiliser ID
        this.#request // Original request
      );
      // results.push(data); // Store result of each update
      // }

      return this.#h.response({ data }); // Respond with the aggregated results
    } catch (error) {
      return this.#h.response({ error });
    }
  }

  async getFertiliserById() {
    try {
      const { fertiliserId } = this.#request.params;
      const { records } = await this.#fertiliserManuresService.getById(
        fertiliserId
      );

      return this.#h.response(records);
    } catch (error) {
      console.error("Error in getFertiliserById controller:", error);
      return this.#h.response({ error });
    }
  }

  async getFertiliserByFarmIdAndYear() {
    try {
      const { fertiliserId } = this.#request.params;
      const { farmId } = this.#request.query;
      const { harvestYear } = this.#request.query;
      const records =
        await this.#fertiliserManuresService.getFertiliserByFarmIdAndYear(
          fertiliserId,
          farmId,
          harvestYear
        );

      return this.#h.response(records);
    } catch (error) {
      console.error("Error in getFertiliserByFarmIdAndYear controller:", error);
      return this.#h.response({ error });
    }
  }

  async deleteFertiliserManureByIds() {
    const { fertliserManureIds } = this.#request.payload; // assuming an array of IDs is passed in the payload
    const userId = this.#request.userId;

    try {
      // Loop through each fertliserManureIds and call the service method to delete it
      for (let fertliserManureId of fertliserManureIds) {
        const result =
          await this.#fertiliserManuresService.deleteFertiliserManure(
            fertliserManureId,
            userId,
            this.#request
          );

        if (result?.affectedRows === 0) {
          console.log(
            `Fertiliser manure with ID ${fertliserManureId} not found.`
          );
        }
      }

      return this.#h.response({
        message: "Fertiliser manures deleted successfully.",
      });
    } catch (error) {
      return this.#h.response({ error: error.message });
    }
  }
}

module.exports = { FertiliserManuresController };
