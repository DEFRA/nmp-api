
const { ManagementPeriodService } = require("./management-period.service");
class ManagementPeriodController {
    #request;
    #h;
    #managementPeriodService;

    constructor(request, h) {
        this.#request = request;
        this.#h = h;
        this.#managementPeriodService = new ManagementPeriodService();
    }

    async getById() {
        try {
            const { managementPeriodId } = this.#request.params;
            const { records } = await this.#managementPeriodService.getById(managementPeriodId);
            return this.#h.response({ ManagementPeriods: records });
        } catch (error) {
            console.error(error);
            return this.#h.response({ error });
        }
    }

    async getManagementPeriodByCropId() {
        try {
            const { cropId } = this.#request.params;
            const { shortSummary } = this.#request.query;
            let selectOptions = {};
            if (shortSummary) selectOptions = { ID: true, CropID: true };
            const { records } = await this.#managementPeriodService.getBy(
                'CropID',
                cropId,
                selectOptions,
            );
            return { ManagementPeriods: records };
        } catch (error) {
            return this.#h.response({ error });
        }
    }
}

module.exports = { ManagementPeriodController };