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
            const totalN = await this.#fertiliserManuresService.getFertiliserManureNitrogenSum(
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


}

module.exports = { FertiliserManuresController };
