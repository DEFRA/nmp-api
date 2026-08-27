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

const organicManureCheckMethods = {
  async checkManureExists(
    managementPeriodID,
    dateFrom,
    dateTo,
    confirm,
    organicManureID,
    isSlurryOnly,
    request,
  ) {
    try {
      // Fetch all manure types from the API
      const allManureTypes = await this.MannerManureTypesService.getData(
        API_ENDPOINTS.MANURE_TYPES,
        request,
      );

      if (!allManureTypes?.data || allManureTypes.data.length === 0) {
        // Log a error if no manure types are returned
        console.error("No manure types returned from the Manner API");
      }

      // Filter manure types: IsLiquid is true OR ManureTypeID = 8 (for Poultry manure)
      const SlurryOrRanManureTypes = allManureTypes.data.filter((manure) =>
        isSlurryOnly
          ? manure.isSlurry === true
          : manure.highReadilyAvailableNitrogen === true,
      );

      // Extract manureTypeIds from the filtered result
      const manureTypeIds = SlurryOrRanManureTypes.map((manure) => manure.id);

      // If no valid manureTypeIds, return false
      if (!manureTypeIds || manureTypeIds.length === 0) {
        return false; // No valid manure types found
      }

      // Query OrganicManures for these manureTypeIds within the date range
      const query = this.repository
        .createQueryBuilder("organicManure")
        .where("organicManure.ManureTypeID IN (:...manureTypeIds)", {
          manureTypeIds,
        })
        .andWhere(
          "organicManure.ApplicationDate BETWEEN :dateFrom AND :dateTo",
          {
            dateFrom,
            dateTo,
          },
        )
        .andWhere("organicManure.ManagementPeriodID = :managementPeriodID", {
          managementPeriodID,
        })
        .andWhere("organicManure.Confirm = :confirm", { confirm });

      if (organicManureID != null) {
        query.andWhere("organicManure.ID != :organicManureID", {
          organicManureID,
        });
      }

      // Execute query
      const manureTypeExists = await query.getCount();

      // Return true if any matching records are found
      return manureTypeExists > 0;
    } catch (error) {
      // Log the error for debugging purposes
      console.error("Error checking for manure existence:", error.message);

      // You can choose to throw the error or handle it silently
      throw new Error(
        "Failed to check manure existence due to an internal error",
      );
    }
  },

  async checkLivestockManureExists(
    cropId,
    dateFrom,
    dateTo,
    organicManureID,
    request,
  ) {
    try {
      const allManureTypes =
        await this.MannerManureTypesService.getAllManureTypesList(request);
      if (!allManureTypes?.data || allManureTypes.data.length === 0) {
        console.error("No manure types returned from the Manner API");
      }
      const livestockManureTypes = allManureTypes.data.filter(
        (manure) => manure.manureGroupID === 1,
      );
      const manureTypeIds = livestockManureTypes.map((manure) => manure.id);
      if (!manureTypeIds || manureTypeIds.length === 0) {
        return false; // No valid manure types found
      }

      const query = this.repository
        .createQueryBuilder("organicManure")
        .where("organicManure.ManureTypeID IN (:...manureTypeIds)", {
          manureTypeIds,
        })
        .innerJoin(
          "ManagementPeriods",
          "M",
          "M.ID = organicManure.ManagementPeriodID",
        )
        .andWhere("M.CropID = :cropId", { cropId })
        .andWhere(
          "organicManure.ApplicationDate BETWEEN :dateFrom AND :dateTo",
          {
            dateFrom: new Date(dateFrom),
            dateTo: new Date(dateTo),
          },
        );

      if (organicManureID != null) {
        query.andWhere("organicManure.ID != :organicManureID", {
          organicManureID,
        });
      }
      const manureTypeExists = await query.getCount();
      return manureTypeExists > 0;
    } catch (error) {
      console.error("Error checking for manure existence:", error.message);
      throw new Error(
        "Failed to check manure existence due to an internal error",
      );
    }
  },

  async getP205AndK20fromfertiliser(managementPeriodId) {
    let sumOfP205 = 0;
    let sumOfK20 = 0;
    const fertiliserData = await this.fertiliserRepository.find({
      where: {
        ManagementPeriodID: managementPeriodId,
      },
      select: {
        P2O5: true,
        K2O: true,
      },
    });

    if (fertiliserData && fertiliserData.length > 0) {
      for (const fertiliser of fertiliserData) {
        sumOfP205 += fertiliser.P2O5 || 0;
        sumOfK20 += fertiliser.K2O || 0;
      }
    }
    return { p205: sumOfP205, k20: sumOfK20 };
  },
};

module.exports = { organicManureCheckMethods };
