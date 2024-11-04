const RB209GrasslandService = require('./grassland.service');

class RB209GrasslandController {
    #request;
    #h;
    #service;

    constructor(request, h) {
        this.#request = request;
        this.#h = h;
        this.#service = new RB209GrasslandService();
    }

    async getGrasslandSeasonsByCountryId() {
        const url = this.#request.url.pathname.split('/rb209')[1];
        try {
            const data = await this.#service.getData(url);
            return this.#h.response(data);
        } catch (error) {
            return this.#h.response({ error });
        }
    }

    async getGrasslandSeasonBySeasonId() {
        const { seasonId } = this.#request.params;
        const url = this.#request.url.pathname.split('/rb209')[1];
        try {
            const data = await this.#service.getData(url);
            return this.#h.response(data);
        } catch (error) {
            return this.#h.response({ error });
        }
    }

    async getGrasslandFieldTypesByCountryId() {
        const url = this.#request.url.pathname.split('/rb209')[1];
        try {
            const data = await this.#service.getData(url);
            return this.#h.response(data);
        } catch (error) {
            return this.#h.response({ error });
        }
    }

    async getGrasslandFieldTypeByFieldTypeId() {
        const { fieldTypeId } = this.#request.params;
        const url = this.#request.url.pathname.split('/rb209')[1];
        try {
            const data = await this.#service.getData(url);
            return this.#h.response(data);
        } catch (error) {
            return this.#h.response({ error });
        }
    }

    async getGrassGrowthClassesByCountryId() {
        const url = this.#request.url.pathname.split('/rb209')[1];
        try {
            const data = await this.#service.getData(url);
            return this.#h.response(data);
        } catch (error) {
            return this.#h.response({ error });
        }
    }

    async getGrassGrowthClassByGrassGrowthClassId() {
        const { grassGrowthClassId } = this.#request.params;
        const url = this.#request.url.pathname.split('/rb209')[1];
        try {
            const data = await this.#service.getData(url);
            return this.#h.response(data);
        } catch (error) {
            return this.#h.response({ error });
        }
    }

    async getGrassGrowthClassBySoilTypeIdAndRainfallAndAltitudeAndChalk() {
        const { soilTypeId, rainfall, altitude, chalk } = this.#request.params;
        const url = this.#request.url.pathname.split('/rb209')[1];
        try {
            const data = await this.#service.getData(url);
            return this.#h.response(data);
        } catch (error) {
            return this.#h.response({ error });
        }
    }

    async getCropMaterialsByCountryId() {
        const url = this.#request.url.pathname.split('/rb209')[1];
        try {
            const data = await this.#service.getData(url);
            return this.#h.response(data);
        } catch (error) {
            return this.#h.response({ error });
        }
    }

    async getCropMaterialByCropMaterialId() {
        const { cropMaterialId } = this.#request.params;
        const url = this.#request.url.pathname.split('/rb209')[1];
        try {
            const data = await this.#service.getData(url);
            return this.#h.response(data);
        } catch (error) {
            return this.#h.response({ error });
        }
    }

    async getYieldTypeByYieldTypeId() {
        const { yieldTypeId } = this.#request.params;
        const url = this.#request.url.pathname.split('/rb209')[1];
        try {
            const data = await this.#service.getData(url);
            return this.#h.response(data);
        } catch (error) {
            return this.#h.response({ error });
        }
    }

    async getYieldTypesByCountryId() {
        const url = this.#request.url.pathname.split('/rb209')[1];
        try {
            const data = await this.#service.getData(url);
            return this.#h.response(data);
        } catch (error) {
            return this.#h.response({ error });
        }
    }

    async getSoilNitrogenSuppliesByCountryId() {
        const url = this.#request.url.pathname.split('/rb209')[1];
        try {
            const data = await this.#service.getData(url);
            return this.#h.response(data);
        } catch (error) {
            return this.#h.response({ error });
        }
    }

    async getSoilNitrogenSupplyItemBySoilNitrogenSupplyId() {
        const { soilNitrogenSupplyId } = this.#request.params;
        const url = this.#request.url.pathname.split('/rb209')[1];
        try {
            const data = await this.#service.getData(url);
            return this.#h.response(data);
        } catch (error) {
            return this.#h.response({ error });
        }
    }

    async getGrassHistoriesByCountryId() {
        const url = this.#request.url.pathname.split('/rb209')[1];
        try {
            const data = await this.#service.getData(url);
            return this.#h.response(data);
        } catch (error) {
            return this.#h.response({ error });
        }
    }

    async getGrassHistoryByGrassHistoryId() {
        const { grassHistoryId } = this.#request.params;
        const url = this.#request.url.pathname.split('/rb209')[1];
        try {
            const data = await this.#service.getData(url);
            return this.#h.response(data);
        } catch (error) {
            return this.#h.response({ error });
        }
    }

    async getSequenceItemsByCountryId() {
        const url = this.#request.url.pathname.split('/rb209')[1];
        try {
            const data = await this.#service.getData(url);
            return this.#h.response(data);
        } catch (error) {
            return this.#h.response({ error });
        }
    }

    async getSequenceItemBySequenceItemId() {
        const { sequenceItemId } = this.#request.params;
        const url = this.#request.url.pathname.split('/rb209')[1];
        try {
            const data = await this.#service.getData(url);
            return this.#h.response(data);
        } catch (error) {
            return this.#h.response({ error });
        }
    }

    async getGrassSequencesBySeasonIdAndFieldTypeIdAndCountryId() {
        const { seasonId, fieldTypeId, countryId } = this.#request.params;
        const url = this.#request.url.pathname.split('/rb209')[1];
        try {
            const data = await this.#service.getData(url);
            return this.#h.response(data);
        } catch (error) {
            return this.#h.response({ error });
        }
    }

    async getGrassSequenceItemByGrassSequenceId() {
        const { grassSequenceId } = this.#request.params;
        const url = this.#request.url.pathname.split('/rb209')[1];
        try {
            const data = await this.#service.getData(url);
            return this.#h.response(data);
        } catch (error) {
            return this.#h.response({ error });
        }
    }

    async getSoilNitrogenSupplyByGrassHistoryId() {
        const { grassHistoryId } = this.#request.params;
        const url = this.#request.url.pathname.split('/rb209')[1];
        try {
            const data = await this.#service.getData(url);
            return this.#h.response(data);
        } catch (error) {
            return this.#h.response({ error });
        }
    }

    async getGrasslandFieldTypeItemByFieldTypeId() {
        const { fieldTypeId } = this.#request.params;
        const url = this.#request.url.pathname.split('/rb209')[1];
        try {
            const data = await this.#service.getData(url);
            return this.#h.response(data);
        } catch (error) {
            return this.#h.response({ error });
        }
    }

}

module.exports = { RB209GrasslandController };
