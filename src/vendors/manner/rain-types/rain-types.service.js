const MannerBaseService = require("../base.service");

class MannerRainTypesService extends MannerBaseService {

async findFirstRow(request) {
    // Fetch the rain types list from the service
    const rainMannerList = await this.getData(
        "rain-types",
        request
    );

    // Check if the response was successful and data exists
    if (rainMannerList.success && rainMannerList.data) {
        // Find the entry with ID 1
        const defaultEntry = rainMannerList.data.find(
            (item) => item.id === 1
        );

        if (defaultEntry) {
            return defaultEntry;
        } else {
            throw new Error("Rain type with ID 1 not found");
        }
    } else {
        throw new Error("Failed to fetch rain type data or data is unavailable");
    }
}
}

module.exports = MannerRainTypesService;
