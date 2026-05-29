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

const ORGANIC_MANURE_MATCH_FIELDS = [
  ["ManureTypeID", "ManureTypeID"],
  ["Nitrogen", "N"],
  ["P2O5", "P2O5"],
  ["SO3", "SO3"],
  ["K2O", "K2O"],
  ["MgO", "MgO"],
  ["UricAcid", "UricAcid"],
  ["DryMatterPercent", "DryMatterPercent"],
  ["NH4N", "NH4N"],
  ["NO3N", "NO3N"],
];

function isOrganicManureMatch(item, organicManure) {
  const itemDate = new Date(item?.ApplicationDate);
  const organicDate = new Date(organicManure?.ApplicationDate);

  if (itemDate.getTime() !== organicDate.getTime()) {
    return false;
  }

  return ORGANIC_MANURE_MATCH_FIELDS.every(
    ([itemKey, organicKey]) => item?.[itemKey] === organicManure?.[organicKey],
  );
}

const organicManureReportMethods = {
  async getOrganicManureByFarmIdAndYear(organicManureId, farmId, harvestYear) {
    try {
      const storedProcedure =
        "EXEC dbo.spOrganicManures_GetByFarmIdAndYear @farmId = @0, @harvestYear = @1";
      const organicManureList = await this.executeQuery(storedProcedure, [
        farmId,
        harvestYear,
      ]);

      const organicManure = await this.repository.findOne({
        where: { ID: organicManureId },
      });

      const records =
        organicManureList.length > 0 && organicManure != null
          ? organicManureList.filter((item) =>
              isOrganicManureMatch(item, organicManure),
            )
          : null;

      return records;
    } catch (error) {
      console.error("Error occurred while fetching organic records:", error);
      return null;
    }
  },
  async getTotalAvailableNitrogenByManagementPeriodID(managementPeriodID) {
    const organicManuresResult = await this.repository
      .createQueryBuilder("OrganicManures")
      .select(
        "SUM(COALESCE(OrganicManures.AvailableNForNMax, OrganicManures.AvailableN))",
        "totalN",
      )
      .where("OrganicManures.ManagementPeriodID = :managementPeriodID", {
        managementPeriodID,
      })
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
    const organicResult = await organicManuresResult.getRawOne();
    return organicResult.totalN;
  },

  async getClosedPeriodByID(soilTypeId, queries) {
    const {
      fieldType,
      harvestYear,
      sowingDate,
      countryId,
      cropGroupId,
      cropTypeId,
      isPerennial,
    } = queries;

    return AppDataSource.transaction(async (transactionalManager) => {
      try {
        const storedProcedure = `
        EXEC [spWarning_GetOrganicManureClosedPeriod]
        @SoilTypeId = @0,
        @FieldType = @1,
        @HarvestYear = @2,
        @SowingDate = @3,
        @CountryId = @4,
        @CropGroupId = @5,
        @CropTypeId = @6,
        @IsPerennial = @7
      `;

        const result = await transactionalManager.query(storedProcedure, [
          soilTypeId,
          fieldType,
          harvestYear,
          sowingDate,
          countryId,
          cropGroupId,
          cropTypeId,
          isPerennial,
        ]);

        return result[0];
      } catch (error) {
        console.error("Error fetching organic manure closed period:", error);
        throw error;
      }
    });
  },

  async getTotalApplicationRate(
    cropId,
    fromDate,
    toDate,
    organicManureID,
    isPoultry,
    request,
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

    // Fetch all manure types from the API
    const allManureTypes = await this.MannerManureTypesService.getData(
      API_ENDPOINTS.MANURE_TYPES,
      request,
    );
    const highRanManureTypes = allManureTypes.data.filter(
      (manure) => manure.highReadilyAvailableNitrogen === true,
    );

    let manureTypeIds = highRanManureTypes.map((manure) => manure.id);

    // Apply poultry logic
    if (isPoultry) {
      manureTypeIds = [ManureTypeMapper.PoultryManure];
    } else {
      manureTypeIds = manureTypeIds.filter(
        (id) => id !== ManureTypeMapper.PoultryManure,
      ); // Exclude poultry
    }

    const query = this.repository
      .createQueryBuilder("O")
      .select("SUM(COALESCE(O.ApplicationRate, 0))", "totalApplicationRate")
      .innerJoin("ManagementPeriods", "M", "O.ManagementPeriodID = M.ID")
      .where("M.CropID = :cropId", { cropId })
      .andWhere("O.ApplicationDate BETWEEN :fromDate AND :toDate", {
        fromDate: fromDateFormatted,
        toDate: toDateFormatted,
      })
      .andWhere("O.ManureTypeID IN (:...manureTypeIds)", {
        manureTypeIds,
      });

    if (organicManureID != null) {
      query.andWhere("O.ID != :organicManureID", { organicManureID });
    }

    const result = await query.getRawOne();

    return Number.parseInt(result?.totalApplicationRate) || 0;
  },

  async checkGreenCompostExists(fieldId, fromDate, toDate, organicManureID) {
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

    const fromDateFormatted = new Date(fromDate);
    fromDateFormatted.setHours(
      START_OF_DAY.HOUR,
      START_OF_DAY.MINUTE,
      START_OF_DAY.SECOND,
      START_OF_DAY.MILLISECOND,
    );

    const toDateFormatted = new Date(toDate);
    toDateFormatted.setHours(
      END_OF_DAY.HOUR,
      END_OF_DAY.MINUTE,
      END_OF_DAY.SECOND,
      END_OF_DAY.MILLISECOND,
    );

    const query = this.repository
      .createQueryBuilder("O")
      .select("1") // lightweight existence check
      .innerJoin("ManagementPeriods", "M", "O.ManagementPeriodID = M.ID")
      .innerJoin("Crops", "C", MANAGEMENT_PERIOD_TO_CROP_JOIN)
      .where(CROP_TO_FIELD_CONDITION, { fieldId })
      .andWhere("O.ApplicationDate BETWEEN :fromDate AND :toDate", {
        fromDate: fromDateFormatted,
        toDate: toDateFormatted,
      })
      .andWhere("O.ManureTypeID IN (:...manureTypeIds)", {
        manureTypeIds: [
          ManureTypeMapper.GreenCompost,
          ManureTypeMapper.GreenFoodCompost,
        ],
      })
      .limit(1);

    if (organicManureID != null) {
      query.andWhere("O.ID != :organicManureID", {
        organicManureID,
      });
    }

    const result = await query.getRawOne();

    return !!result; // true if exists, false otherwise
  },
};

module.exports = { organicManureReportMethods };
