const { CropTypeMapper } = require("../constants/crop-type-mapper");

const recommendationDetailMethods = {
mapRecommendationField(recDataKey, recommendationRow, data) {
  const PREFIXES = {
    CROP: "Crop_",
    RECOMMENDATION: "Recommendation_",
    MANAGEMENT_PERIOD: "ManagementPeriod_",
    FERTILISER_MANURE: "FertiliserManure_",
  };

  if (recDataKey.startsWith(PREFIXES.CROP)) {
    data.Crop[recDataKey.slice(PREFIXES.CROP.length)] =
      recommendationRow[recDataKey];
  } else if (recDataKey.startsWith(PREFIXES.RECOMMENDATION)) {
    data.Recommendation[recDataKey.slice(PREFIXES.RECOMMENDATION.length)] =
      recommendationRow[recDataKey];
  } else if (recDataKey.startsWith(PREFIXES.MANAGEMENT_PERIOD)) {
    data.ManagementPeriod[recDataKey.slice(PREFIXES.MANAGEMENT_PERIOD.length)] =
      recommendationRow[recDataKey];
  } else if (recDataKey.startsWith(PREFIXES.FERTILISER_MANURE)) {
    data.FertiliserManure[recDataKey.slice(PREFIXES.FERTILISER_MANURE.length)] =
      recommendationRow[recDataKey];
  } else {
    console.log("no assignment");
  }
},

async mapRecommendationRow(recommendationRow, harvestYear, fieldId) {
  const data = {
    Crop: {},
    Recommendation: {},
    ManagementPeriod: {},
    FertiliserManure: {},
  };

  const previousAppliedLime = await this.processSoilRecommendations(
    harvestYear,
    fieldId,
    recommendationRow,
  );
  data.Recommendation.PreviousAppliedLime = previousAppliedLime || 0;

  Object.keys(recommendationRow).forEach((recDataKey) => {
    this.mapRecommendationField(recDataKey, recommendationRow, data);
  });

  return data;
},

async getPreviousYearPKBalance(fieldId, harvestYear) {
  return this.PKbalanceRepository.findOne({
    where: {
      Year: harvestYear - 1,
      FieldID: fieldId,
    },
    select: {
      ID: true,
      PBalance: true,
      KBalance: true,
    },
  });
},

async findDefoliationSequenceDescription(DefoliationSequenceID) {
  try {
    const defoliationSequence = await this.rB209GrassService.getData(
      `Grass/DefoliationSequence/${DefoliationSequenceID}`
    );

    return defoliationSequence
      ? defoliationSequence.defoliationSequenceDescription
      : null;
  } catch (error) {
    console.error(
      `Error fetching Defoliation Sequence by id ${DefoliationSequenceID}`,
      error
    );
    return "Unknown";
  }
},

async findSwardType(SwardTypeID) {
  try {
    let swardTypeName = null;
    const swardTypeList = await this.rB209GrassService.getData(
      `Grass/SwardTypes`
    );

    if (swardTypeList.length > 0) {
      const matchingSward = swardTypeList.find(
        (x) => x.swardTypeId === SwardTypeID
      );
      if (matchingSward != null) {
        swardTypeName = matchingSward ? matchingSward.swardType : null;
      }
    }

    return swardTypeName;
  } catch (error) {
    console.error(`Error fetching sward Type list`, error);
    return "Unknown";
  }
},

async findGrassSeason(seasonID) {
  try {
    const season = await this.rB209GrasslandService.getData(
      `Grassland/GrasslandSeason/${seasonID}`
    );
    return season.seasonName;
  } catch (error) {
    console.error(`Error fetching Grassland Season`, error);
    return "Unknown";
  }
},

async addGrassCropNames(crop) {
  const isGrass = crop.CropTypeID === CropTypeMapper.GRASS;

  return {
    ...crop,
    EstablishmentName: isGrass && crop.Establishment !== null
      ? await this.findGrassSeason(crop.Establishment)
      : null,
    SwardManagementName: isGrass && crop.SwardManagementID !== null
      ? await this.findSwardTypeManagment(crop.SwardManagementID)
      : null,
    SwardTypeName: isGrass && crop.SwardTypeID !== null
      ? await this.findSwardType(crop.SwardTypeID)
      : null,
    DefoliationSequenceName: isGrass && crop.DefoliationSequenceID !== null
      ? await this.findDefoliationSequenceDescription(crop.DefoliationSequenceID)
      : null,
  };
},

async groupRecommendationsByCrop(mappedRecommendations, PKbalance) {
  const groupedObj = {};

  for (const recommendation of mappedRecommendations) {
    groupedObj[recommendation.Crop.ID] = {
      Crop: await this.addGrassCropNames(recommendation.Crop),
      PKbalance,
      Recommendations: (
        groupedObj[recommendation.Crop.ID]?.Recommendations || []
      ).concat({
        Recommendation: recommendation.Recommendation,
        ManagementPeriod: recommendation.ManagementPeriod,
        FertiliserManure: recommendation.FertiliserManure,
      }),
    };
  }

  return groupedObj;
},

async getOrganicManuresWithDetails(managementPeriodId, request) {
  const organicManures = await this.organicManureRepository.find({
    where: {
      ManagementPeriodID: managementPeriodId,
    },
    select: {
      ID: true,
      ManureTypeID: true,
      ApplicationDate: true,
      ApplicationRate: true,
      ApplicationMethodID: true,
    },
  });

  return Promise.all(
    organicManures.map(async (organicManure) =>
      this.addOrganicManureReferenceDetails(organicManure, request),
    )
  );
},

async addOrganicManureReferenceDetails(organicManure, request) {
  const manureTypeId = Number(organicManure.ManureTypeID);
  const applicationMethodId = Number(organicManure.ApplicationMethodID);
  const manureTypeData = await this.MannerManureTypesService.getData(
    `/manure-types/${manureTypeId}`,
    request,
  );
  const applicationMethodData =
    await this.MannerApplicationMethodService.getData(
      `/application-methods/${applicationMethodId}`,
      request,
    );

  return {
    ...organicManure,
    ManureTypeName: manureTypeData.data.name,
    ApplicationMethodName: applicationMethodData.data.name,
  };
},

async getFertiliserManuresForManagementPeriod(managementPeriodId) {
  return this.FertiliserManuresRepository.find({
    where: {
      ManagementPeriodID: managementPeriodId,
    },
    select: {
      ID: true,
      ApplicationDate: true,
      ApplicationRate: true,
      N: true,
      P2O5: true,
      K2O: true,
      MgO: true,
      SO3: true,
      Na2O: true,
      Lime: true,
      NH4N: true,
      NO3N: true,
    },
  });
},

async addRecommendationDetails(recData, request) {
  const comments = await this.recommendationCommentRepository.find({
    where: {
      RecommendationID: recData.Recommendation.ID,
    },
  });
  const organicManuresWithDetails = await this.getOrganicManuresWithDetails(
    recData.ManagementPeriod.ID,
    request,
  );
  const FertiliserManures =
    await this.getFertiliserManuresForManagementPeriod(
      recData.ManagementPeriod.ID,
    );
  const mergedRecommendation = {
    ...recData.Recommendation,
    ...recData.FertiliserManure,
  };

  return {
    Recommendation: mergedRecommendation,
    RecommendationComments: comments,
    ManagementPeriod: recData.ManagementPeriod,
    OrganicManures: organicManuresWithDetails,
    FertiliserManures,
  };
},

async addDetailsToGroupedRecommendations(groupedObj, request) {
  return Promise.all(
    Object.values(groupedObj).map(async (recommendationGroup) => ({
      ...recommendationGroup,
      Recommendations: await Promise.all(
        recommendationGroup.Recommendations.map((recData) =>
          this.addRecommendationDetails(recData, request),
        )
      ),
    }))
  );
},

async getNutrientsRecommendationsForField(fieldId, harvestYear, request) {
  try {
    const storedProcedure ="EXEC dbo.spRecommendations_GetRecommendations @fieldId = @0, @harvestYear = @1";
    const recommendations = await this.executeQuery(storedProcedure, [fieldId,harvestYear]);
    const mappedRecommendations = await Promise.all(
      recommendations.map((recommendation) =>
        this.mapRecommendationRow(recommendation, harvestYear, fieldId),
      )
    );
    console.log("mappedRecommendationsNew", mappedRecommendations);

    const PKbalance = await this.getPreviousYearPKBalance(
      fieldId,
      harvestYear,
    );
    const groupedObj = await this.groupRecommendationsByCrop(
      mappedRecommendations,
      PKbalance,
    );
    console.log("groupedObj", groupedObj);

    return this.addDetailsToGroupedRecommendations(groupedObj, request);
  } catch (error) {
    console.error("Error while fetching join data:", error);
    throw error;
  }
},

async findSwardTypeManagment(SwardManagementID) {
  try {
    let swardManagementsName = null;
    const swardManagementsList = await this.rB209GrassService.getData(
      `Grass/SwardManagements`
    );
console.log('swardManagementsList',swardManagementsList);
    if (swardManagementsList.length > 0) {
      const matchingSward = swardManagementsList.find(
        (x) => x.swardManagementId === SwardManagementID
      );
      if (matchingSward != null) {
        swardManagementsName = matchingSward
          ? matchingSward.swardManagement
          : null;
      }
    }

    return swardManagementsName;
  } catch (error) {
    console.error(`Error fetching sward Management list`, error);
    return "Unknown";
  }
},

async getByManagementPeriodId(managementPeriodID) {
  const record = await this.repository.findOne({
    where: {
      ManagementPeriodID: managementPeriodID,
    },
  });
  return record;
}
};

module.exports = { recommendationDetailMethods };
