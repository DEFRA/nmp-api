const boom = require("@hapi/boom");
const { FarmEntity } = require("../db/entity/farm.entity");
const { BaseService } = require("../base/base.service");
const { AppDataSource } = require("../db/data-source");
const { FieldEntity } = require("../db/entity/field.entity");
const { getRepository } = require("typeorm");

class FarmService extends BaseService {
  constructor() {
    super(FarmEntity);
    this.repository = getRepository(FarmEntity);
  }
  async farmExistsByNameAndPostcode(farmName, postcode, id = null) {
    return (await this.farmCountByNameAndPostcode(farmName, postcode, id)) > 0;
  }

  async farmCountByNameAndPostcode(farmName, postcode, id = null) {
    if (!farmName || !postcode) {
      throw boom.badRequest("Farm Name and Postcode are required");
    }

    const query = this.repository
      .createQueryBuilder("Farms")
      .where("Farms.Name = :name", { name: farmName.trim() })
      .andWhere("REPLACE(Farms.Postcode, ' ', '') = :postcode", {
        postcode: postcode.replace(/\s+/g, ""),
      })
      .andWhere(id !== null ? "Farms.ID != :id" : "1 = 1", { id });

    return await query.getCount();
  }
  async deleteFarmAndRelatedEntities(farmId) {
    const farmToDelete = await this.repository.findOne({
      where: { ID: farmId },
    });
    if (farmToDelete == null) {
      throw boom.notFound(`Farm with ID ${farmId} not found`);
    }
    try {
      const storedProcedure = "EXEC dbo.spFarms_DeleteFarm @farmId = @0";
      await AppDataSource.query(storedProcedure, [farmId]);
    } catch (error) {
      console.error("Error deleting farm:", error);
      throw boom.internal("Error deleting farm");
    }
  }

  async createFarm(farmBody, userId) {
    const farmExists = await this.farmExistsByNameAndPostcode(
      farmBody.Name.trim(),
      farmBody.Postcode.trim()
    );
    if (farmExists) {
      throw boom.badRequest("Farm already exists with this Name and Postcode");
    }
    const newFarm = await this.repository.save({
      ...farmBody,
      Name: farmBody.Name.trim(),
      Postcode: farmBody.Postcode.trim(),
      CreatedByID: userId,
      CreatedOn: new Date(),
    });
    return newFarm;
  }
  async getFarm(name, postcode) {
    const farm = await this.repository.findOne({
      where: {
        Name: name.trim(),
        Postcode: postcode.trim(),
      },
    });
    return farm;
  }

  async updateFarm(updatedFarmData, userId, farmId) {
    const result = await AppDataSource.transaction(
      async (transactionalManager) => {
        const existingFarm = await transactionalManager.findOne(FarmEntity, {
          where: { ID: farmId },
        });
        if (!existingFarm) {
          throw boom.notFound(`Farm with ID ${farmId} not found`);
        }
        const { ID, ...updateData } = updatedFarmData;
        const updateResult = await transactionalManager.update(
          FarmEntity,
          farmId,
          {
            ...updateData,
            ModifiedByID: userId,
            ModifiedOn: new Date(),
          }
        );
        if (updateResult.affected === 0) {
          throw boom.notFound(`Farm with ID ${farmId} not found`);
        }
        if (
          updatedFarmData.FieldsAbove300SeaLevel !== 2 ||
          updatedFarmData.NVZFields !== 2
        ) {
          const fieldUpdateData = {};
          if (updatedFarmData.FieldsAbove300SeaLevel !== 2) {
            fieldUpdateData.IsAbove300SeaLevel =
              updatedFarmData.FieldsAbove300SeaLevel === 1;
          }
          if (updatedFarmData.NVZFields !== 2) {
            fieldUpdateData.IsWithinNVZ = updatedFarmData.NVZFields === 1;
          }
          await transactionalManager.update(
            FieldEntity,
            { FarmID: farmId },
            fieldUpdateData
          );
        }
        const updatedFarm = await transactionalManager.findOne(FarmEntity, {
          where: { ID: farmId },
        });
        return updatedFarm;
      }
    );
    return result;
  }
}

module.exports = { FarmService };
