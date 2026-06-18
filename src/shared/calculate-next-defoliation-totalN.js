const { In } = require("typeorm");
const { OrganicManureEntity } = require("../db/entity/organic-manure.entity");
const { ManagementPeriodEntity } = require("../db/entity/management-period.entity");
const { CropOrderMapper } = require("../constants/crop-order-mapper");


class CalculateNextDefoliationService {
  constructor() {}

async calculateAvailableNForNextDefoliation(
  transactionalManager,
  managementPeriod,
  CropData,
) {
  let availableNForNextDefoliation = null;

  if (managementPeriod?.Defoliation > 1) {
    const previousDefoliationManagementPeriods =
      await transactionalManager.find(ManagementPeriodEntity, {
        where: {
          CropID: CropData.ID,
          Defoliation: managementPeriod.Defoliation - 1,
        },
      });

    const prevManagementPeriodIDs = previousDefoliationManagementPeriods.map(
      (mp) => mp.ID
    );

    if (prevManagementPeriodIDs.length > 0) {
      const organicManures = await transactionalManager.find(
        OrganicManureEntity,
        {
          where: {
            ManagementPeriodID: In(prevManagementPeriodIDs),
          },
        }
      );

      availableNForNextDefoliation = organicManures.reduce(
        (sum, manure) => sum + (manure.AvailableNForNextDefoliation || 0),
        0
      );
    }
  }else{
    return null
  }

  if (CropData.CropOrder === CropOrderMapper.SECONDCROP) {
    return null;
  }

  return availableNForNextDefoliation;
}
}

module.exports = { CalculateNextDefoliationService };
