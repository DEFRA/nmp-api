const axios = require('axios');
const EnvironmentService = require('../../shared/environment.service');


class AddressLookupService {
    constructor() {
        this.request = axios.create({
            baseURL: EnvironmentService.ADDR_LOOKUP_BASE_URL(),
            headers: {
                'Ocp-Apim-Subscription-Key': EnvironmentService.ADDR_LOOKUP_SUBSCRIPTION_KEY(),
            },
        });
    }

    async check() {
        return 'Connected!';
    }

    async getAddressesByPostCode(postcode, offset) {
        const response = await this.request.get(`/addresses?postcode=${postcode}&offset=${offset}`);
        return response.data;
    }
}

module.exports = AddressLookupService;
