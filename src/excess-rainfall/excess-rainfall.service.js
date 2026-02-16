const { BaseService } = require("../base/base.service");
const { AppDataSource } = require("../db/data-source");
const { ExcessRainfallsEntity } = require("../db/entity/excess-rainfalls.entity");
const boom = require("@hapi/boom");
const { FieldEntity } = require("../db/entity/field.entity");
const { UpdatingFutureRecommendations } = require("../shared/updating-future-recommendations-service");

class ExcessRainfallService extends BaseService {
  constructor() {
    super(ExcessRainfallsEntity);
    this.repository = AppDataSource.getRepository(ExcessRainfallsEntity);
    this.fieldRepository = AppDataSource.getRepository(FieldEntity);
    this.updatingFutureRecommendations = new UpdatingFutureRecommendations();
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
  async createExcessRainfall(farmId, year, body, userId, request) {
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
      // Fetch the fields associated with the given farmId
      const fields = await this.fieldRepository.find({
        where: { FarmID: farmId },
      });
   
      // Extract the list of fieldIds from the result
      const fieldIds = fields.map((field) => field.ID);
    

      // Call the function to update recommendations for all fields in the background
      await this.updateRecommendationsForFields(fieldIds, year, request, userId);

      return {
        ExcessRainfall,
      };
    });
  }
 

  // Function to update recommendations for each fieldId sequentially
  async updateRecommendationsForFields(fieldIds, year, request, userId) {
    for (const fieldId of fieldIds) {
        this.updatingFutureRecommendations.updateRecommendationsForField(fieldId, year, request, userId)  
    }
  }

  async updateExcessRainfall(updatedExcessRainfallData, userId, farmId, year,request) {
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

        const fields = await this.fieldRepository.find({
          where: { FarmID: farmId },
        });

        // Extract the list of fieldIds from the result
        const fieldIds = fields.map((field) => field.ID);

        // Call the function to update recommendations for all fields in the background
        this.updateRecommendationsForFields(
          fieldIds,
          year,
          request,
          userId
        );
    return updatedExcessRainfall;
  }
}

module.exports = { ExcessRainfallService };
