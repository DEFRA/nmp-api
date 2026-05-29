const {
  AppDataSource,
  MoreThan,
  CropEntity,
  FarmManureTypeEntity,
  ManagementPeriodEntity,
  OrganicManureEntity,
  FieldEntity,
  WarningMessagesEntity,
  CropTypeMapper,
  WarningCodesMapper,
  ManureTypeMapper,
  normalizeDateWithTime,
  JOINS,
  MANAGEMENT_PERIOD_TO_CROP_JOIN,
  CROP_TO_FIELD_CONDITION,
  API_ENDPOINTS,
} = require("./organic-manure-dependencies");
const sumOfNitrogen = "SUM(O.N * O.ApplicationRate)"
const applicationDateCondition ="O.ApplicationDate BETWEEN :fromDate AND :toDate";
const organicManureQueryMethods = {
  async getTotalNitrogenByManagementPeriod(
    managementPeriodID,
    fromDate,
    toDate,
    confirm,
    organicManureID,
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
    const query = this.repository
      .createQueryBuilder("O") // O = OrganicManures
      .select(sumOfNitrogen, "totalN")
      .where("O.ManagementPeriodID = :managementPeriodID", {
        managementPeriodID,
      })
      .andWhere(applicationDateCondition, {
        fromDate: fromDateFormatted,
        toDate: toDateFormatted,
      })
      .andWhere("O.Confirm = :confirm", { confirm });

    if (organicManureID != null) {
      query.andWhere("O.ID != :organicManureID", {
        organicManureID,
      });
    }

    const result = await query.getRawOne();
    return result?.totalN ?? 0;
  }
,

  async getTotalNitrogenByCropID(
    cropID,
    fromDate,
    toDate,
    confirm,
    organicManureID,
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

    const fromDateFormatted = normalizeDateWithTime(fromDate, START_OF_DAY);
    const toDateFormatted = normalizeDateWithTime(toDate, END_OF_DAY);
    const query = this.repository
      .createQueryBuilder("O") // O = OrganicManures
      .select(sumOfNitrogen, "totalN")
      .innerJoin(
        "ManagementPeriods",
        "M",
        JOINS.ORGANIC_MANURE_TO_MANAGEMENT_PERIOD,
      )
      .where("M.CropID = :cropID", { cropID })
      .andWhere(applicationDateCondition, {
        fromDate: fromDateFormatted,
        toDate: toDateFormatted,
      })
      .andWhere("O.Confirm = :confirm", { confirm });

    if (organicManureID != null) {
      query.andWhere("O.ID != :organicManureID", { organicManureID });
    }

    const result = await query.getRawOne();
    return Number(result?.totalN ?? 0);
  }

,

  async formatDateRange(fromDate, toDate) {
     // Ensure fromDate starts at 00:00:00 and toDate ends at 23:59:59
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
  return {
    fromDateFormatted: normalizeDateWithTime(fromDate, START_OF_DAY),
    toDateFormatted: normalizeDateWithTime(toDate, END_OF_DAY),
  };
}

,

  async getTotalNitrogen(fieldId, fromDate, toDate, confirm, organicManureID) {
   const { fromDateFormatted, toDateFormatted } = await this.formatDateRange(
     fromDate,
     toDate
   );
    const query = this.repository
      .createQueryBuilder("O") // O = OrganicManures
      .select(sumOfNitrogen, "totalN")
      .innerJoin(
        "ManagementPeriods",
        "M",
        JOINS.ORGANIC_MANURE_TO_MANAGEMENT_PERIOD,
      )
      .innerJoin("Crops", "C", MANAGEMENT_PERIOD_TO_CROP_JOIN)
      .where(CROP_TO_FIELD_CONDITION, { fieldId }) // note lowercase 'fieldId'
      .andWhere(applicationDateCondition, {
        fromDate: fromDateFormatted,
        toDate: toDateFormatted,
      })
      .andWhere("O.Confirm = :confirm", { confirm });
    if (organicManureID != null) {
      query.andWhere("O.ID != :organicManureID", {
        organicManureID,
      });
    }
    const result = await query.getRawOne();

    return result.totalN;
  }

,

  async getTotalNitrogenIfIsGreenFoodCompost(
    fieldId,
    fromDate,
    toDate,
    confirm,
    isGreenFoodCompost,
    organicManureID,
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

    // Add additional filtering for ManureTypeID when isGreenFoodCompost is true
    const query = this.repository
      .createQueryBuilder("O") // O = OrganicManures
      .select(sumOfNitrogen, "totalN")
      .innerJoin(
        "ManagementPeriods",
        "M",
        JOINS.ORGANIC_MANURE_TO_MANAGEMENT_PERIOD,
      )
      .innerJoin("Crops", "C", MANAGEMENT_PERIOD_TO_CROP_JOIN)
      .where(CROP_TO_FIELD_CONDITION, { fieldId }) // note lowercase 'fieldId'
      .andWhere(applicationDateCondition, {
        fromDate: fromDateFormatted,
        toDate: toDateFormatted,
      })
      .andWhere("O.Confirm = :confirm", { confirm });
    if (isGreenFoodCompost) {
      query.andWhere("O.ManureTypeID IN (:...manureTypeIDs)", {
        manureTypeIDs: [24, 32],
      });
    }
    if (!isGreenFoodCompost) {
      query.andWhere("O.ManureTypeID NOT IN (:...manureTypeIDs)", {
        manureTypeIDs: [24, 32],
      });
    }
    if (organicManureID != null) {
      query.andWhere("O.ID != :organicManureID", {
        organicManureID,
      });
    }
    console.log("organicManureID", organicManureID);
    const result = await query.getRawOne();
    console.log("organicManureID", result.totalN);
    return result.totalN;
  }

,

  async getManureTypeIdsbyFieldAndYear(fieldId, year, confirm) {
    const cropId = (
      await this.cropRepository.findOne({
        where: { FieldID: fieldId, Year: year, Confirm: confirm },
      })
    )?.ID;

    const managementPeriodId = (
      await this.managementPeriodRepository.findOne({
        where: { CropID: cropId },
      })
    )?.ID;

    const organicManures = await this.repository.find({
      where: {
        ManagementPeriodID: managementPeriodId,
      },
    });

    const manureTypeIds = organicManures.map((data) => data.ManureTypeID);
    return manureTypeIds;
  }

,

  async getManureTypeIdsByManagementPeriod(managementPeriodID) {
    const rows = await this.repository.find({
      select: ["ManureTypeID"],
      where: {
        ManagementPeriodID: managementPeriodID,
      },
    });

    return rows.map((r) => r.ManureTypeID);
  }

,

  async getFirstCropData(transactionalManager, FieldID, Year) {
    const data = await transactionalManager.findOne(CropEntity, {
      where: {
        FieldID: FieldID,
        Year: Year,
        Confirm: false, // Or 0, depending on your schema
        CropOrder: 1,
      },
    });

    return data;
  }

,

  async getManagementPeriodId(id) {
    const data = await this.managementPeriodRepository.findOne({
      where: {
        CropID: id,
      },
      select: ["ID"], // Only select the ID column
    });

    return data?.ID; // Return only the ID field
  }

,

  async getPKBalanceData(field, year, allPKBalanceData) {
    try {
      // Find the data by filtering allPKBalanceData
      const pkBalanceData = allPKBalanceData.find(
        (data) => data.FieldID === field.ID && data.Year === year,
      );

      return pkBalanceData || null; // Return the found data or null if not found
    } catch (error) {
      console.error("Error fetching PK Balance data:", error);
      throw error; // Re-throw the error or handle it as needed
    }
  }

,

  async checkIfManagementPeriodExistsInOrganicManure(
    ManagementPeriodID,
    organicManureAllData,
  ) {
    const managementPeriodExists = organicManureAllData.some(
      (data) => data.ManagementPeriodID === ManagementPeriodID,
    );

    return !!(managementPeriodExists);
  }

,

  async saveOrganicManureForOtherCropType(
    organicManureData,
    _mannerOutputs,
    transactionalManager,
    userId,
    organicManures,
  ) {
    const savedOrganicManure = await transactionalManager.save(
      OrganicManureEntity,
      this.repository.create({
        ...organicManureData.OrganicManure,
        ...(organicManureData.OrganicManure.ID === 0 ? { ID: null } : {}),
        CreatedByID: userId,
        CreatedOn: new Date(),
      }),
    );
    organicManures.push(savedOrganicManure);
  }


};

module.exports = { organicManureQueryMethods };
