const { BaseService } = require("../base/base.service");
const { AppDataSource } = require("../db/data-source");
const boom = require("@hapi/boom");

const {
  StoreCapacitiesEntity,
} = require("../db/entity/store-capacities.entity");
const { StorageTypesEntity } = require("../db/entity/storage-types.Entity");
const {
  SolidManureTypesEntity,
} = require("../db/entity/solid-manure-types.entity");
const { Not } = require("typeorm");

class StoreCapacitiesService extends BaseService {
  constructor() {
    super(StoreCapacitiesEntity);
    this.repository = AppDataSource.getRepository(StoreCapacitiesEntity);
    this.storageTypesRepository =
      AppDataSource.getRepository(StorageTypesEntity);
    this.solidManureTypesRepository = AppDataSource.getRepository(
      SolidManureTypesEntity
    );
  }

  async getByFarmId(farmId) {
    const records = await this.repository.find({
      where: {
        FarmID: farmId,
      },
    });

    const enrichedRecords = [];

    for (const record of records) {
      const storageType = record.StorageTypeID
        ? await this.storageTypesRepository.findOne({
            where: { ID: record.StorageTypeID },
          })
        : null;

      const solidManureType = record.SolidManureTypeID
        ? await this.solidManureTypesRepository.findOne({
            where: { ID: record.SolidManureTypeID },
          })
        : null;

      enrichedRecords.push({
        ...record,
        StorageTypeName: storageType ? storageType.Name : null,
        SolidManureTypeName: solidManureType ? solidManureType.Name : null,
      });
    }

    return enrichedRecords;
  }

  async checkExist(FarmId, StoreName, ID) {
    const whereCondition = {
      FarmID: FarmId,
      StoreName: StoreName,
    };
    if (ID) {
      const record = await this.repository.findOne({
        where: {
          ...whereCondition,
          ID: Not(ID),
        },
      });
      return !!record;
    } else {
      // normal check when ID is not provided
      const record = await this.repository.findOne({
        where: whereCondition,
      });
      return !!record;
    }
  }
  async createStoreCapacities(payload, userId) {
    return await AppDataSource.transaction(async (transactionalManager) => {
      const {
        FarmID,
        StoreName,
        CreatedByID,
        CreatedOn,
        ...cleanPayload
      } = payload;
      const existingRecord = await transactionalManager.findOne(
        StoreCapacitiesEntity,
        { where: { FarmID: FarmID, StoreName: StoreName } }
      );

      if (existingRecord) {
        throw boom.conflict(
          `Record with FarmID ${FarmID}, and StoreName ${StoreName} already exists`
        );
      }

      const newRecord = transactionalManager.create(StoreCapacitiesEntity, {
        ...cleanPayload,
        FarmID: FarmID,
        StoreName: StoreName,
        CreatedOn: new Date(),
        CreatedByID: userId,
      });

      const saved = await transactionalManager.save(
        StoreCapacitiesEntity,
        newRecord
      );

      const savedRecord = await transactionalManager.findOne(
        StoreCapacitiesEntity,
        { where: { FarmID: FarmID } }
      );

      return savedRecord;
    });
  }

  async copyStorageCapacities(body, userId) {
    const { FarmID, Year, CopyYear } = body;

    return await AppDataSource.transaction(async (transactionalManager) => {
      const storageCapacities = await transactionalManager.find(
        StoreCapacitiesEntity,
        { where: { FarmID: FarmID, Year: CopyYear } }
      );

      if (!storageCapacities) {
        throw boom.notFound(`No storage capacities found for Year ${CopyYear}`);
      }

      const newRecords = storageCapacities.map((record) => {
        return transactionalManager.create(StoreCapacitiesEntity, {
          ...record,
          ID: null,
          Year: Year,
          CreatedOn: new Date(),
          CreatedByID: userId,
        });
      });
      return await transactionalManager.save(StoreCapacitiesEntity, newRecords);
    });
  }

  async updateStoreCapacities(payload, userId) {
    return await AppDataSource.transaction(async (transactionalManager) => {
      const {
        ID,
        FarmID,
        StoreName,
        CreatedByID,
        CreatedOn,
        ...dataToUpdate
      } = payload;

      // Check if another record with same FarmID, Year, StoreName already exists
      const existingRecord = await transactionalManager.findOne(
        StoreCapacitiesEntity,
        {
          where: {
            FarmID,
            StoreName,
            ID: Not(ID),
          },
        }
      );

      if (existingRecord) {
        throw boom.conflict(
          `Store capacity with FarmID ${FarmID}, and StoreName ${StoreName} already exists.`
        );
      }

      const result = await transactionalManager.update(
        StoreCapacitiesEntity,
        { ID, FarmID },
        {
          StoreName: StoreName,
          ...dataToUpdate,
          ModifiedByID: userId,
          ModifiedOn: new Date(),
        }
      );

      if (result.affected === 0) {
        throw boom.notFound(
          `NutrientsLoadingFarmDetails with FarmId ${FarmID}  not found`
        );
      }

      const updated = await transactionalManager.findOneBy(
        StoreCapacitiesEntity,
        { ID, FarmID }
      );

      return updated;
    });
  }

  async deleteStoreCapacitiesById(storeCapacitiesId) {
    await AppDataSource.manager.transaction(async (transactionalManager) => {
      // 1. Check if the record exists
      const storeCapacities = await transactionalManager.findOne(
        StoreCapacitiesEntity,
        { where: { ID: storeCapacitiesId } }
      );

      if (!storeCapacities) {
        throw boom.notFound(
          `storeCapacity with ID ${storeCapacitiesId} not found`
        );
      }

      // 2. Stored procedure to delete StoreCapacities by StoreCapacityID
      const storedProcedure =
        "EXEC dbo.spStoreCapacities_DeleteStoreCapacities @StoreCapacityID = @0";

      try {
        await transactionalManager.query(storedProcedure, [storeCapacitiesId]);
      } catch (error) {
        console.error("Error deleting storeCapacities:", error);
      }
    });
  }
}

module.exports = { StoreCapacitiesService };
