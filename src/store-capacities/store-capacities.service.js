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

  async getByFarmAndYear(farmId, year) {
    const records = await this.repository.find({
      where: {
        FarmID: farmId,
        Year: year,
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

  async checkExist(FarmId, Year, StoreName,ID) {
      const whereCondition = {
        FarmID: FarmId,
        Year: Year,
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
        Year,
        StoreName,
        CreatedByID,
        CreatedOn,
        ...cleanPayload
      } = payload;
      const existingRecord = await transactionalManager.findOne(
        StoreCapacitiesEntity,
        { where: { FarmID: FarmID, Year: Year, StoreName: StoreName } }
      );

      if (existingRecord) {
        throw boom.conflict(
          `Record with FarmID ${FarmID}, Year ${Year}, and StoreName ${StoreName} already exists`
        );
      }

      const newRecord = transactionalManager.create(StoreCapacitiesEntity, {
        ...cleanPayload,
        FarmID: FarmID,
        Year: Year,
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
        { where: { FarmID: FarmID, Year: Year } }
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
      const { ID, FarmID, Year, StoreName, CreatedByID, CreatedOn, ...dataToUpdate } =
        payload;

      // Check if another record with same FarmID, Year, StoreName already exists
      const existingRecord = await transactionalManager.findOne(
        StoreCapacitiesEntity,
        {
          where: {
            FarmID,
            Year,
            StoreName,
            ID: Not(ID), 
          },
        }
      );

       if (existingRecord) {
         throw boom.conflict(
           `Store capacity with FarmID ${FarmID}, Year ${Year}, and StoreName ${StoreName} already exists.`
         );
       }

      const result = await transactionalManager.update(
        StoreCapacitiesEntity,
        { ID, FarmID },
        {
          StoreName:StoreName,
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
}

module.exports = { StoreCapacitiesService };
