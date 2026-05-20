const RB209ArableService = require("./arable.service")

class RB209ArableController {
    #request;
    #h;
    #service;

    constructor(request, h) {
        this.#request = request;
        this.#h = h;
        this.#service = new RB209ArableService();
    }

    async getCropGroups() {
        const url = this.#request.url.pathname.split('/rb209')[1];
        try {
            const data = await this.#service.getData(url);
            return this.#h.response(data);
        } catch (error) {
            return this.#h.response({ error });
        }
    }

    async getCropGroupsBycropGroupId() {
         return this.getCropGroups();
    }

    async getCropTypes() {
         return this.getCropGroups();
    }

    async getCropTypesByCropGroupId() {
         return this.getCropGroups();
    }

    async getCropTypeByCropTypeId() {
        return this.getCropGroups();
    }

    async getCropInfo1s() {
       return this.getCropGroups();
    }

    async getCropInfo1sByCropTypeId() {
        return this.getCropGroups();
    }

    async getCropInfo1ByCropTypeIdAndCropInfo1Id() {
        return this.getCropGroups();
    }

    async getCropInfo2s() {
        return this.getCropGroups();
    }

    async getCropInfo2CropInfo2Id() {
        return this.getCropGroups();
    }

    async getPotatoGroups() {
       return this.getCropGroups();
    }

    async getPotatoGroupByPotatoGroupId() {
        return this.getCropGroups();
    }

    async getPotatoVarieties() {
        return this.getCropGroups();
    }

    async getPotatoVarietiesByPotatoGroupId() {
        return this.getCropGroups();
    }

    async getPotatoVarietyByPotatoVarietyId() {
        return this.getCropGroups();
    }
}

module.exports = { RB209ArableController };
