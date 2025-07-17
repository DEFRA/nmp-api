const { BaseService } = require("../base/base.service");
const { AppDataSource } = require("../db/data-source");

const boom = require("@hapi/boom");
const {
  NutrientsLoadingManuresEntity,
} = require("../db/entity/nutrients-loading-manures-entity");

class NutrientsLoadingManuresService extends BaseService {
  constructor() {
    super(NutrientsLoadingManuresEntity);
    this.repository = AppDataSource.getRepository(
      NutrientsLoadingManuresEntity
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
        DryMatterPercent,
        NH4N,
        UricAcid,
        NO3N,
        K2O,
        SO3,
        MgO,
        ModifiedByID,
        ModifiedOn,
        ...cleanPayload
      } = NutrientsLoadingManure; 
console.log('Clean',cleanPayload)
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
      //  if (payload.SaveDefaultForFarm) {
      //           farmManureTypeData = {
      //             FarmID: payload.FarmID,
      //             ManureTypeID: payload.ManureTypeID,
      //             ManureTypeName: OrganicManure.ManureTypeName,
      //             FieldTypeID: organicManureData.FieldTypeID,
      //             TotalN: OrganicManure.N, //Nitogen
      //             DryMatter: OrganicManure.DryMatterPercent,
      //             NH4N: OrganicManure.NH4N, //ammonium
      //             Uric: OrganicManure.UricAcid, //uric acid
      //             NO3N: OrganicManure.NO3N, //nitrate
      //             P2O5: OrganicManure.P2O5,
      //             SO3: OrganicManure.SO3,
      //             K2O: OrganicManure.K2O,
      //             MgO: OrganicManure.MgO,
      //           };
      //         }
      //         if (farmManureTypeData) {
      //                 const existingFarmManureType =
      //                   await this.farmManureTypeRepository.findOne({
      //                     where: {
      //                       FarmID: farmManureTypeData.FarmID,
      //                       ManureTypeID: farmManureTypeData.ManureTypeID,
      //                       ManureTypeName: farmManureTypeData.ManureTypeName,
      //                     },
      //                   });
      //                 if (existingFarmManureType) {
      //                   await this.farmManureTypeRepository.update(
      //                     existingFarmManureType.ID,
      //                     {
      //                       ...farmManureTypeData,
      //                       ModifiedByID: userId,
      //                       ModifiedOn: new Date(),
      //                     }
      //                   );

      //                   savedFarmManureType = {
      //                     ...existingFarmManureType,
      //                     ...farmManureTypeData,
      //                     ModifiedByID: userId,
      //                     ModifiedOn: new Date(),
      //                   };
      //                 } else {
      //                   savedFarmManureType = await transactionalManager.save(
      //                     FarmManureTypeEntity,
      //                     this.farmManureTypeRepository.create({
      //                       ...farmManureTypeData,
      //                       CreatedByID: userId,
      //                       CreatedOn: new Date(),
      //                     })
      //                   );
      //                 }
      //               }
      return saved;
      //}
    });
  }

  async updateNutrientsLoadingManures(payload, userId) {
    const { ID, FarmID, CreatedByID, CreatedOn, ...dataToUpdate } = payload;

    const result = await this.repository.update(
      { FarmID },
      {
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

    const updated = await this.repository.findOneBy({ FarmID });

    return updated;
  }
}

module.exports = { NutrientsLoadingManuresService };
