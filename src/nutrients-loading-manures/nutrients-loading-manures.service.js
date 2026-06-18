const { BaseService } = require("../base/base.service");
const { AppDataSource } = require("../db/data-source");

const boom = require("@hapi/boom");
const {
  NutrientsLoadingManuresEntity,
} = require("../db/entity/nutrients-loading-manures-entity");
const {
  FarmManureTypeEntity,
} = require("../db/entity/farm-manure-type.entity");
const {
  NutrientsLoadingFarmDetailsEntity,
} = require("../db/entity/nutrients-loading-farm-details-entity");

class NutrientsLoadingManuresService extends BaseService {
  constructor() {
    super(NutrientsLoadingManuresEntity);
    this.repository = AppDataSource.getRepository(
      NutrientsLoadingManuresEntity
    );
    this.farmManureTypeRepository =
      AppDataSource.getRepository(FarmManureTypeEntity);
    this.nutrientsLoadingFarmDetailsRepository = AppDataSource.getRepository(
      NutrientsLoadingFarmDetailsEntity
    );
  }

  async getByFarmIdAndYear(farmId) {
    const record = await this.repository.findBy({
      FarmID: farmId,
    });

    return { NutrientsLoadingFarmDetails: record };
  }

  async checkRecordExists(farmId) {
    return await this.recordExists({
      FarmID: farmId,
    });
  }

  async createNutrientsLoadingManures(payload, userId) {
    //const { FarmID, } = payload;
    console.log("payload", payload);
    return await AppDataSource.transaction(async (transactionalManager) => {
      // const existingRecord = await transactionalManager.findOne(
      //   NutrientsLoadingManuresEntity,
      //   { where: { FarmID: FarmID } }
      // );
      const { SaveDefaultForFarm, NutrientsLoadingManure } = payload;
      const {
        ID,
        // DryMatterPercent,
        // NH4N,
        // UricAcid,
        // NO3N,
        // K2O,
        // SO3,
        // MgO,
        EncryptedID,
        ModifiedByID,
        ModifiedOn,
        ...cleanPayload
      } = NutrientsLoadingManure;
      const newRecord = transactionalManager.create(
        NutrientsLoadingManuresEntity,
        {
          ...cleanPayload,
          CreatedByID: userId,
          CreatedOn: new Date(),
        }
      );
      // console.log("cleanPayload123", ...cleanPayload);
      // console.log("cleanPayload12223", newRecord);
      const saved = await transactionalManager.save(
        NutrientsLoadingManuresEntity,
        newRecord
      );
      let savedFarmManureType;
      let farmManureTypeData;

      if (SaveDefaultForFarm) {
        farmManureTypeData = {
          FarmID: NutrientsLoadingManure.FarmID,
          ManureTypeID: NutrientsLoadingManure.ManureTypeID,
          ManureTypeName: NutrientsLoadingManure.ManureType,
          FieldTypeID: 1,
          TotalN: NutrientsLoadingManure.NContent, //Nitogen
          DryMatter: NutrientsLoadingManure.DryMatterPercent,
          NH4N: NutrientsLoadingManure.NH4N, //ammonium
          Uric: NutrientsLoadingManure.UricAcid, //uric acid
          NO3N: NutrientsLoadingManure.NO3N, //nitrate
          P2O5: NutrientsLoadingManure.PContent,
          SO3: NutrientsLoadingManure.SO3,
          K2O: NutrientsLoadingManure.K2O,
          MgO: NutrientsLoadingManure.MgO,
        };
      }
      if (farmManureTypeData) {
        const existingFarmManureType =
          await this.farmManureTypeRepository.findOne({
            where: {
              FarmID: farmManureTypeData.FarmID,
              ManureTypeID: farmManureTypeData.ManureTypeID,
              ManureTypeName: farmManureTypeData.ManureTypeName,
            },
          });
        if (existingFarmManureType) {
          await transactionalManager.update(
            FarmManureTypeEntity,
            existingFarmManureType.ID,
            {
              ...farmManureTypeData,
              ModifiedByID: userId,
              ModifiedOn: new Date(),
            }
          );

          savedFarmManureType = {
            ...existingFarmManureType,
            ...farmManureTypeData,
            ModifiedByID: userId,
            ModifiedOn: new Date(),
          };
        } else {
          savedFarmManureType = await transactionalManager.save(
            FarmManureTypeEntity,
            this.farmManureTypeRepository.create({
              ...farmManureTypeData,
              CreatedByID: userId,
              CreatedOn: new Date(),
            })
          );
        }
      }

      const nutrientsLoadingFarmDetails =
        await this.nutrientsLoadingFarmDetailsRepository.findOneBy({
          FarmID: NutrientsLoadingManure.FarmID,
          CalendarYear: new Date(
            NutrientsLoadingManure.ManureDate
          ).getFullYear(),
        });
      if (
        nutrientsLoadingFarmDetails != null &&
        nutrientsLoadingFarmDetails.IsAnyLivestockImportExport != 1
      ) {
        await await transactionalManager.update(
          NutrientsLoadingFarmDetailsEntity,
          nutrientsLoadingFarmDetails.ID,
          {
            IsAnyLivestockImportExport: 1,
          }
        );
      }
      return saved;
      //}
    });
  }

  async updateNutrientsLoadingManures(payload, userId) {
    return await AppDataSource.transaction(async (transactionalManager) => {
      const { SaveDefaultForFarm, NutrientsLoadingManure } = payload;
      const {
        ID,
        FarmID,
        CreatedByID,
        CreatedOn,
        // DryMatterPercent,
        // NH4N,
        // UricAcid,
        // NO3N,
        // K2O,
        // SO3,
        // MgO,
        EncryptedID,
        ...dataToUpdate
      } = NutrientsLoadingManure;
      const result = await transactionalManager.update(
        NutrientsLoadingManuresEntity,
        { ID, FarmID },
        {
          ...dataToUpdate,
          ModifiedByID: userId,
          ModifiedOn: new Date(),
        }
      );

      let savedFarmManureType;
      let farmManureTypeData;

      if (SaveDefaultForFarm) {
        farmManureTypeData = {
          FarmID: NutrientsLoadingManure.FarmID,
          ManureTypeID: NutrientsLoadingManure.ManureTypeID,
          ManureTypeName: NutrientsLoadingManure.ManureType,
          FieldTypeID: 1,
          TotalN: NutrientsLoadingManure.NContent, //Nitogen
          DryMatter: NutrientsLoadingManure.DryMatterPercent,
          NH4N: NutrientsLoadingManure.NH4N, //ammonium
          Uric: NutrientsLoadingManure.UricAcid, //uric acid
          NO3N: NutrientsLoadingManure.NO3N, //nitrate
          P2O5: NutrientsLoadingManure.PContent,
          SO3: NutrientsLoadingManure.SO3,
          K2O: NutrientsLoadingManure.K2O,
          MgO: NutrientsLoadingManure.MgO,
        };
      }
      if (farmManureTypeData) {
        const existingFarmManureType =
          await this.farmManureTypeRepository.findOne({
            where: {
              FarmID: farmManureTypeData.FarmID,
              ManureTypeID: farmManureTypeData.ManureTypeID,
              ManureTypeName: farmManureTypeData.ManureTypeName,
            },
          });
        if (existingFarmManureType) {
          await transactionalManager.update(
            FarmManureTypeEntity,
            existingFarmManureType.ID,
            {
              ...farmManureTypeData,
              ModifiedByID: userId,
              ModifiedOn: new Date(),
            }
          );

          savedFarmManureType = {
            ...existingFarmManureType,
            ...farmManureTypeData,
            ModifiedByID: userId,
            ModifiedOn: new Date(),
          };
        } else {
          savedFarmManureType = await transactionalManager.save(
            FarmManureTypeEntity,
            this.farmManureTypeRepository.create({
              ...farmManureTypeData,
              CreatedByID: userId,
              CreatedOn: new Date(),
            })
          );
        }
      }
      if (result.affected === 0) {
        throw boom.notFound(
          `NutrientsLoadingFarmDetails with FarmId ${FarmID}  not found`
        );
      }

      const updated = await transactionalManager.findOneBy(
        NutrientsLoadingManuresEntity,
        { ID, FarmID }
      );

      return updated;
    });
  }
  async deleteNutrientsLoadingManureById(nutrientsLoadingManureId) {
    // Check if the NutrientsLoadingManure exists
    const nutrientsLoadingManureData = await this.repository.findOne({
      where: { ID: nutrientsLoadingManureId },
    });

    // If the NutrientsLoadingManure does not exist, throw a not found error
    if (nutrientsLoadingManureData == null) {
      throw boom.notFound(
        `NutrientsLoadingManure with ID ${nutrientsLoadingManureId} not found`
      );
    }

    try {
      // Call the stored procedure to delete the NutrientsLoadingManure
      const year=new Date(
            nutrientsLoadingManureData.ManureDate
          ).getFullYear();
      const storedProcedure =
        "EXEC [dbo].[spNutrientsLoadingManures_DeleteNutrientsLoadingManures] @NutrientsLoadingManureID = @0";
      await AppDataSource.query(storedProcedure, [nutrientsLoadingManureId]);
      const nutrientsLoadingManure = await this.repository
        .createQueryBuilder("NutrientsLoadingManures")
        .where("NutrientsLoadingManures.FarmID = :farmID", { farmID: nutrientsLoadingManureData.FarmID })
        .andWhere("YEAR(NutrientsLoadingManures.ManureDate) = :year", {
          year: year,
        })
        .getOne();
      if (nutrientsLoadingManure == null) {
  const nutrientsLoadingFarmDetails = await this.nutrientsLoadingFarmDetailsRepository.findOneBy({
    FarmID: nutrientsLoadingManureData.FarmID, 
    CalendarYear: year, 
  });

  if (nutrientsLoadingFarmDetails) {

    await this.nutrientsLoadingFarmDetailsRepository.update(
      nutrientsLoadingFarmDetails.ID,
      {
        IsAnyLivestockImportExport: null,
      }
    );
  }
}

    } catch (error) {
      // Log the error and throw an internal server error
      console.error("Error deleting NutrientsLoadingManure:", error);
    }
  }
}

module.exports = { NutrientsLoadingManuresService };
