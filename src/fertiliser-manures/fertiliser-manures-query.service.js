const { AppDataSource } = require("../db/data-source");
const {
  FertiliserManuresEntity,
} = require("../db/entity/fertiliser-manures.entity");
const { CropTypeMapper } = require("../constants/crop-type-mapper");
const { ManureTypeMapper } = require("../constants/manure-type-mapper");
const { normalizeDateWithTime } = require("../shared/dataValidate");

const fertiliserManuresQueryMethods = {
async getFertiliserManureNitrogenSum(
  fieldId,
  fromDate,
  toDate,
  confirm,
  fertiliserId,
) {
  const START_OF_DAY = {
    HOUR: 0,
    MINUTE: 0,
    SECOND: 0,
    MILLISECOND: 0,
  };

  const END_OF_DAY = {
    HOUR: 23,
    MINUTE: 59,
    SECOND: 59,
    MILLISECOND: 999,
  };
  // Ensure fromDate starts at 00:00:00 and toDate ends at 23:59:59

  const fromDateFormatted = normalizeDateWithTime(fromDate, START_OF_DAY);
  const toDateFormatted = normalizeDateWithTime(toDate, END_OF_DAY);

  const queryBuilder = this.repository
    .createQueryBuilder("F")
    .select("SUM(F.N * F.ApplicationRate)", "totalN")
    .innerJoin("ManagementPeriods", "M", "F.ManagementPeriodID = M.ID")
    .innerJoin("Crops", "C", "M.CropID = C.ID")
    .where("C.FieldID = :fieldId", { fieldId }) // note lowercase 'fieldId'
    .andWhere("F.ApplicationDate BETWEEN :fromDate AND :toDate", {
      fromDate: fromDateFormatted,
      toDate: toDateFormatted,
    })
    .andWhere("F.Confirm = :confirm", { confirm });

  // Only apply the fertiliserId condition if it's not null or undefined
  if (fertiliserId !== null && fertiliserId !== undefined) {
    queryBuilder.andWhere("F.ID != :fertiliserId", {
      fertiliserId,
    });
  }

  const result = await queryBuilder.getRawOne();
  return result.totalN;
},

async getTotalNitrogen(
  managementPeriodID,
  confirm,
  _fertiliserID,
  organicManureID,
) {
  const fertiliserManuresResult = this.repository
    .createQueryBuilder("fertiliserManures")
    .select(
      "SUM(fertiliserManures.N * fertiliserManures.ApplicationRate)",
      "totalN",
    )
    .where("fertiliserManures.ManagementPeriodID = :managementPeriodID", {
      managementPeriodID,
    })
    .andWhere("fertiliserManures.Confirm = :confirm", { confirm });

  const fertiliserResult = await fertiliserManuresResult.getRawOne();
  console.log("fertiliserResult", fertiliserResult);
  // return result.totalN;
  // .getRawOne();
  const organicManuresResult = this.organicManureRepository
    .createQueryBuilder("organicManures")
    .select("SUM(organicManures.AvailableNForNMax)", "totalN")
    .where("organicManures.ManagementPeriodID = :managementPeriodID", {
      managementPeriodID,
    })
    .andWhere("organicManures.Confirm = :confirm", { confirm })
    .andWhere(
      "organicManures.ManureTypeID NOT IN (:...excludedManureTypes)",
      {
        excludedManureTypes: [
          ManureTypeMapper.StrawMulch,
          ManureTypeMapper.PaperCrumbleBiologicallyTreated,
          ManureTypeMapper.PaperCrumbleChemicallyPhysciallyTreated,
        ],
      },
    ); //exclude StrawMulch, PaperCrumbleChemicallyPhysciallyTreated,PaperCrumbleBiologicallyTreated
  // const organicManuresResult = await this.repository
  //   .createQueryBuilder("O") // O = OrganicManures
  //   .select("SUM(O.AvailableNForNMax)", "totalN")
  //   .innerJoin("ManagementPeriods", "M", "O.ManagementPeriodID = M.ID")
  //   .innerJoin("Crops", "C", "M.CropID = C.ID")
  //   .where("C.FieldID = :fieldId", { fieldId }) // note lowercase 'fieldId'
  //   .andWhere("O.Confirm = :confirm", { confirm });
  if (organicManureID !== null && organicManureID !== undefined) {
    organicManuresResult.andWhere("organicManures.ID != :organicManureID", {
      organicManureID,
    });
  }

  const organicResult = await organicManuresResult.getRawOne();
  console.log("organicResult", organicResult);
  return fertiliserResult.totalN + organicResult.totalN;
},

async getTotalNitrogenByCropID(
  cropID,
  confirm,
  fertiliserID,
  organicManureID,
) {
  // -------------------------
  // FERTILISERS
  // -------------------------
  const fertiliserQB = this.repository
    .createQueryBuilder("F")
    .select("SUM(F.N * F.ApplicationRate)", "totalN")
    .innerJoin("ManagementPeriods", "M", "F.ManagementPeriodID = M.ID")
    .where("M.CropID = :cropID", { cropID })
    .andWhere("F.Confirm = :confirm", { confirm });

  if (fertiliserID !== null && fertiliserID !== undefined) {
    fertiliserQB.andWhere("F.ID != :fertiliserID", { fertiliserID });
  }

  const fertiliserResult = await fertiliserQB.getRawOne();

  // -------------------------
  // ORGANIC MANURES
  // -------------------------
  const organicQB = this.organicManureRepository
    .createQueryBuilder("O")
    .select("SUM(O.AvailableNForNMax)", "totalN")
    .innerJoin("ManagementPeriods", "M", "O.ManagementPeriodID = M.ID")
    .where("M.CropID = :cropID", { cropID })
    .andWhere("O.Confirm = :confirm", { confirm })
    .andWhere("O.ManureTypeID NOT IN (:...excludedManureTypes)", {
      excludedManureTypes: [
        ManureTypeMapper.StrawMulch,
        ManureTypeMapper.PaperCrumbleBiologicallyTreated,
        ManureTypeMapper.PaperCrumbleChemicallyPhysciallyTreated,
      ],
    });

  if (organicManureID !== null && organicManureID !== undefined) {
    organicQB.andWhere("O.ID != :organicManureID", { organicManureID });
  }

  const organicResult = await organicQB.getRawOne();

  // -------------------------
  // FINAL TOTAL
  // -------------------------
  const fertiliserN = Number(fertiliserResult?.totalN ?? 0);
  const organicN = Number(organicResult?.totalN ?? 0);

  return fertiliserN + organicN;
},

async getTotalP205AndK20(fertiliserData, _managementPeriodId) {
  let sumOfP205 = 0;
  let sumOfK20 = 0;

  if (fertiliserData && fertiliserData.length > 0) {
    for (const fertiliser of fertiliserData) {
      sumOfP205 += fertiliser.P2O5 || 0;
      sumOfK20 += fertiliser.K2O || 0;
    }
  }

  return { p205: sumOfP205, k20: sumOfK20 };
},

async getTotalFertiliserP205AndK20FromRecommandation(
  managementPeriodID,
  recommandationAllData,
) {
  let sumOfFertliserP205 = 0;
  let sumOfFertiliserK20 = 0;

  const recommandationData = recommandationAllData
    .filter((item) => item.ManagementPeriodID === managementPeriodID)
    .map((item) => ({
      FertilizerP2O5: item.FertilizerP2O5,
      FertilizerK2O: item.FertilizerK2O,
    }));

  if (recommandationData && recommandationData.length > 0) {
    for (const recommandation of recommandationData) {
      sumOfFertliserP205 += recommandation.FertilizerP2O5 || 0;
      sumOfFertiliserK20 += recommandation.FertilizerK2O || 0;
    }
  }

  return { p205: sumOfFertliserP205, k20: sumOfFertiliserK20 };
},

async getFertiliserByFarmIdAndYear(fertiliserId, farmId, harvestYear) {
  try {
    const storedProcedure =
      "EXEC dbo.spFertiliserManures_GetByFarmIdAndYear @farmId = @0, @harvestYear = @1";
    const fertiliserData = await this.executeQuery(storedProcedure, [
      farmId,
      harvestYear,
    ]);
    const fertiliser = await this.repository.findOne({
      where: { ID: fertiliserId },
    });

    const records =
      fertiliserData.length > 0 && fertiliser != null
        ? fertiliserData.filter((item) => {
            const itemDate = new Date(item?.ApplicationDate);
            const fertiliserDate = new Date(fertiliser?.ApplicationDate);
            const isSameDate =
              itemDate.getTime() === fertiliserDate.getTime();
            const isSameNutrients =
              item?.Nitrogen === fertiliser?.N &&
              item?.P2O5 === fertiliser?.P2O5 &&
              item?.SO3 === fertiliser?.SO3 &&
              item?.K2O === fertiliser?.K2O &&
              item?.MgO === fertiliser?.MgO;

            const isSameOther = item?.Lime === fertiliser?.Lime;

            const isMatching = isSameDate && isSameNutrients && isSameOther;

            return isMatching;
          })
        : null;

    return records;
  } catch (error) {
    console.error("Error occurred while fetching fertiliser records:", error);
    return null;
  }
},

async getTotalNitrogenByManagementPeriodID(managementPeriodID) {
  const fertiliserManuresResult = await this.repository
    .createQueryBuilder("fertiliserManures")
    .select(
      "SUM(fertiliserManures.N * fertiliserManures.ApplicationRate)",
      "totalN",
    )
    .where("fertiliserManures.ManagementPeriodID = :managementPeriodID", {
      managementPeriodID,
    });

  const fertiliserResult = await fertiliserManuresResult.getRawOne();
  return fertiliserResult.totalN;
},

async getTotalNitrogenByManagementPeriodIDAndIsAutumn(
  managementPeriodID,
  isAutumn,
) {
  const managementPeriod = await this.managementPeriodRepository.findOne({
    where: { ID: managementPeriodID },
  });

  if (!managementPeriod) {
    return 0;
  }

  const crop = await this.cropRepository.findOne({
    where: { ID: managementPeriod.CropID },
    select: ["ID", "CropTypeID", "Year"],
  });

  if (!crop) {
    return 0;
  }

  const { CropTypeID, Year } = crop;

  const qb = this.repository
    .createQueryBuilder("fm")
    .select("SUM(fm.N * fm.ApplicationRate)", "totalN")
    .where("fm.ManagementPeriodID = :managementPeriodID", {
      managementPeriodID,
    });

  if (CropTypeID === CropTypeMapper.WINTEROILSEEDRAPE) {
    const AUTUMN = {
      START_MONTH: 8, // August
      END_MONTH: 12, // December
      START_DAY: 1,
      END_DAY: 31,
    };

    const startAutumn = new Date(
      Year - 1,
      AUTUMN.START_MONTH,
      AUTUMN.START_DAY,
    );
    const endAutumn = new Date(Year - 1, AUTUMN.END_MONTH, AUTUMN.END_DAY);

    if (isAutumn) {
      qb.andWhere(
        "fm.ApplicationDate >= :startAutumn AND fm.ApplicationDate <= :endAutumn",
        { startAutumn, endAutumn },
      );
    } else {
      qb.andWhere("fm.ApplicationDate > :endAutumn", { endAutumn });
    }
  }

  const result = await qb.getRawOne();

  return result?.totalN || 0;
},

async getClosedPeriodByID(countryId, cropTypeId, nvzId) {
  return AppDataSource.transaction(async (transactionalManager) => {
    try {
      const storedProcedure =
        "EXEC [spWarning_GetFertiliserManureClosedPeriod] @countryId = @0, @CropTypeId = @1, @NvzId = @2";
      const result = await transactionalManager.query(storedProcedure, [
        countryId,
        cropTypeId,
        nvzId,
      ]);
      return result[0];
    } catch (error) {
      console.error(error);
      return null;
    }
  });
}
};

module.exports = { fertiliserManuresQueryMethods };
