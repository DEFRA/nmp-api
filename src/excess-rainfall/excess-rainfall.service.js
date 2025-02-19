const { BaseService } = require("../base/base.service");
const { AppDataSource } = require("../db/data-source");
const { ExcessRainfallsEntity } = require("../db/entity/excess-rainfalls.entity");
const boom = require("@hapi/boom");

class ExcessRainfallService extends BaseService {
  constructor() {
    super(ExcessRainfallsEntity);
    this.repository = AppDataSource.getRepository(ExcessRainfallsEntity);
  }
  async getExcessRainfallByFarmIdAndYear(fieldId, year) {
    const excessRainfall = await this.repository.findOneBy({
      FarmID: fieldId,
      Year: year,
    });
    return {
      ExcessRainfall: excessRainfall,
    };
  }
  async checkExcessRainfalExists(farmId, year) {
    return await this.recordExists({ FarmID: farmId, Year: year });
  }
  async createExcessRainfall(farmId, year, body, userId) {
    // Check if an ExcessRainfall with the same farmId and year already exists
    const exists = await this.checkExcessRainfalExists(farmId, year);
    if (exists) {
      throw boom.conflict(
        "ExcessRainfall already exists with this FarmID and Year"
      );
    }

    return await AppDataSource.transaction(async (transactionalManager) => {
      const excessRainfall = this.repository.create({
        ...body,
        FarmID: farmId,
        Year: year, // Assign the year
        CreatedByID: userId,
        CreatedOn: new Date(),
      });

      const ExcessRainfall = await transactionalManager.save(
        ExcessRainfallsEntity,
        excessRainfall
      );

      return {
        ExcessRainfall,
      };
    });
  }

  async updateExcessRainfall(updatedExcessRainfallData, userId, farmId, year) {
    const { ID, CreatedByID, CreatedOn, ...dataToUpdate } =
      updatedExcessRainfallData;

    const result = await this.repository.update(
      { FarmID: farmId, Year: year },
      {
        ...dataToUpdate,
        ModifiedByID: userId,
        ModifiedOn: new Date(),
      }
    );

    if (result.affected === 0) {
      throw boom.notFound(
        `ExcessRainfall with FarmID ${farmId} and Year ${year} not found`
      );
    }

    const updatedExcessRainfall = await this.repository.findOne({
      where: { FarmID: farmId, Year: year }, // Find by FarmID and Year
    });
    return updatedExcessRainfall;
  }
}

module.exports = { ExcessRainfallService };
