const { AppDataSource } = require("../db/data-source");
const { WindspeedEntity } = require("../db/entity/wind-speed.entity");
const { BaseService } = require("../base/base.service");
const MannerWindspeedService = require("../vendors/manner/windspeed/windspeed.service");

class WindspeedService extends BaseService {
  constructor() {
    super(WindspeedEntity);
    this.repository = AppDataSource.getRepository(WindspeedEntity);
    this.MannerWindspeedService = new MannerWindspeedService();
  }

  async findFirstRow(request){
    // Fetch the windspeeds list from the manner service
    const mannerWindSpeedList = await this.MannerWindspeedService.getData(
      "windspeeds",
      request
    );

    // Check if the response was successful and data exists
    if (mannerWindSpeedList.success && mannerWindSpeedList.data) {
      // Sort the windspeeds by ID in ascending order and take the first one
      const sortedList = mannerWindSpeedList.data.sort(
        (a, b) => a.ID - b.ID
      );

      // Return the first row from the sorted list
      const firstRow = sortedList[0];

      return firstRow;
    } else {
      console.error("Failed to fetch windspeed data or data is unavailable");
    }
  }
}

module.exports = { WindspeedService };
