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
        const { managementPeriodID } = this.#request.params;
        const { fromDate, toDate, confirm } = this.#request.query;

        try {
          const totalN =
              await this.#fertiliserManuresService.getFertiliserManureNitrogenSum(
                managementPeriodID,
                fromDate,
                toDate,
                confirm
            );
          return this.#h.response({ TotalN: totalN });
        } catch (error) {
          return this.#h.response({ error });
        }
    }

    async getTotalNitrogen() {
      const { managementPeriodID } = this.#request.params;
      const { confirm } = this.#request.query;
      try {
        const totalN = await this.#fertiliserManuresService.getTotalNitrogen(
          managementPeriodID,
          confirm
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

    async deleteFertiliserById() {
      const { fertiliserId } = this.#request.params;
      const userId = this.#request.userId;
      try {
        console.log("Deletefertliser");
        const result = await this.#fertiliserManuresService.deleteFertiliser(
          fertiliserId,
          userId,
          this.#request
        );
        if (result?.affectedRows === 0) {
          throw boom.notFound(`fertiliser with ID ${fertiliserId} not found.`);
        }
        return this.#h.response({ message: "fertiliser deleted successfully." });
      } catch (error) {
        return this.#h.response({ error: error.message });
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
        const { farmId } =this.#request.query;
        const { harvestYear } = this.#request.query;
        const  records  = await this.#fertiliserManuresService.getFertiliserByFarmIdAndYear(
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
}

module.exports = { FertiliserManuresController };
