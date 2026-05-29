const {
  FarmManureTypeEntity,
} = require("./organic-manure-dependencies");

const organicManureFarmManureTypeMethods = {
  async saveFarmManureTypeDefault(
    farmManureTypeData,
    transactionalManager,
    userId,
  ) {
    const existingFarmManureType =
      await this.farmManureTypeRepository.findOne({
        where: {
          FarmID: farmManureTypeData.FarmID,
          ManureTypeID: farmManureTypeData.ManureTypeID,
          ManureTypeName: farmManureTypeData.ManureTypeName,
        },
      });

    if (existingFarmManureType) {
      await this.farmManureTypeRepository.update(existingFarmManureType.ID, {
        ...farmManureTypeData,
        ModifiedByID: userId,
        ModifiedOn: new Date(),
      });

      return {
        ...existingFarmManureType,
        ...farmManureTypeData,
        ModifiedByID: userId,
        ModifiedOn: new Date(),
      };
    }

    return transactionalManager.save(
      FarmManureTypeEntity,
      this.farmManureTypeRepository.create({
        ...farmManureTypeData,
        CreatedByID: userId,
        CreatedOn: new Date(),
      }),
    );
  },
};

module.exports = { organicManureFarmManureTypeMethods };
