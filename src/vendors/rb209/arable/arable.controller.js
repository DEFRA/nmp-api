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
        const url = this.#request.url.pathname.split('/rb209')[1];
        try {
            const data = await this.#service.getData(url);
            return this.#h.response(data);
        } catch (error) {
            return this.#h.response({ error });
        }
    }

    async getCropTypes() {
        const url = this.#request.url.pathname.split('/rb209')[1];
        try {
            const data = await this.#service.getData(url);
            return this.#h.response(data);
        } catch (error) {
            return this.#h.response({ error });
        }
    }

    async getCropTypesByCropGroupId() {
        const url = this.#request.url.pathname.split('/rb209')[1];
        try {
            const data = await this.#service.getData(url);
            return this.#h.response(data);
        } catch (error) {
            return this.#h.response({ error });
        }
    }

    async getCropTypeByCropTypeId() {
        const url = this.#request.url.pathname.split('/rb209')[1];
        try {
            const data = await this.#service.getData(url);
            return this.#h.response(data);
        } catch (error) {
            return this.#h.response({ error });
        }
    }

    async getCropInfo1s() {
        const url = this.#request.url.pathname.split('/rb209')[1];
        try {
            const data = await this.#service.getData(url);
            return this.#h.response(data);
        } catch (error) {
            return this.#h.response({ error });
        }
    }

    async getCropInfo1sByCropTypeId() {
        const url = this.#request.url.pathname.split('/rb209')[1];
        try {
            const data = await this.#service.getData(url);
            return this.#h.response(data);
        } catch (error) {
            return this.#h.response({ error });
        }
    }

    async getCropInfo1ByCropTypeIdAndCropInfo1Id() {
        const url = this.#request.url.pathname.split('/rb209')[1];
        try {
            const data = await this.#service.getData(url);
            return this.#h.response(data);
        } catch (error) {
            return this.#h.response({ error });
        }
    }

    async getCropInfo2s() {
        const url = this.#request.url.pathname.split('/rb209')[1];
        try {
            const data = await this.#service.getData(url);
            return this.#h.response(data);
        } catch (error) {
            return this.#h.response({ error });
        }
    }

    async getCropInfo2CropInfo2Id() {
        const url = this.#request.url.pathname.split('/rb209')[1];
        try {
            const data = await this.#service.getData(url);
            return this.#h.response(data);
        } catch (error) {
            return this.#h.response({ error });
        }
    }

    async getPotatoGroups() {
        const url = this.#request.url.pathname.split('/rb209')[1];
        try {
            const data = await this.#service.getData(url);
            return this.#h.response(data);
        } catch (error) {
            return this.#h.response({ error });
        }
    }

    async getPotatoGroupByPotatoGroupId() {
        const url = this.#request.url.pathname.split('/rb209')[1];
        try {
            const data = await this.#service.getData(url);
            return this.#h.response(data);
        } catch (error) {
            return this.#h.response({ error });
        }
    }

    async getPotatoVarieties() {
        const url = this.#request.url.pathname.split('/rb209')[1];
        try {
            const data = await this.#service.getData(url);
            return this.#h.response(data);
        } catch (error) {
            return this.#h.response({ error });
        }
    }

    async getPotatoVarietiesByPotatoGroupId() {
        const url = this.#request.url.pathname.split('/rb209')[1];
        try {
            const data = await this.#service.getData(url);
            return this.#h.response(data);
        } catch (error) {
            return this.#h.response({ error });
        }
    }

    async getPotatoVarietyByPotatoVarietyId() {
        const url = this.#request.url.pathname.split('/rb209')[1];
        try {
            const data = await this.#service.getData(url);
            return this.#h.response(data);
        } catch (error) {
            return this.#h.response({ error });
        }
    }
}

module.exports = { RB209ArableController };
