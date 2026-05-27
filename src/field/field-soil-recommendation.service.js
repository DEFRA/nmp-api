const { Between } = require("typeorm");

const fieldSoilRecommendationMethods = {
async processSoilRecommendations(harvestYear, fieldId, Recommendation) {
  try {
    const soilAnalysisYear =
      await fieldSoilRecommendationMethods.getSoilAnalysisYearWithPH.call(
        this,
        harvestYear,
        fieldId,
      );

    if (soilAnalysisYear == null) {
      return null;
    }

    const cropData = await this.findCropDataByID(Recommendation.Crop_ID);
    if (!cropData) {
      return 0;
    }

    const totalLime =
      await fieldSoilRecommendationMethods.getPreviousAppliedLime.call(
        this,
        fieldId,
        cropData,
        soilAnalysisYear,
      );

    if (totalLime <= 0) {
      return 0;
    }

    const result = Recommendation.Recommendation_CropN - totalLime;
    console.log("result", result);

    return result < 0 ? 0 : result;
  } catch (error) {
    console.error("Error in processSoilRecommendations:", error);
    throw error;
  }
},

async getSoilAnalysisYearWithPH(harvestYear, fieldId) {
  const fiveYearBack = 5;
  const soilAnalyses = await this.soilAnalysisRepository.find({
    where: {
      FieldID: fieldId,
      Year: Between(harvestYear - fiveYearBack, harvestYear),
    },
  });
  const soilAnalysisWithPH = soilAnalyses.find((rec) => rec.PH > 0);

  return soilAnalysisWithPH ? soilAnalysisWithPH.Year : null;
},

async getPreviousAppliedLime(fieldId, cropData, soilAnalysisYear) {
  if (cropData.CropOrder === 1) {
    return fieldSoilRecommendationMethods.getFirstCropOrderLime.call(
      this,
      fieldId,
      cropData,
      soilAnalysisYear,
    );
  }

  if (cropData.CropOrder === 2) {
    return fieldSoilRecommendationMethods.getSecondCropOrderLime.call(
      this,
      fieldId,
      cropData,
      soilAnalysisYear,
    );
  }

  return 0;
},

async getFirstCropOrderLime(fieldId, cropData, soilAnalysisYear) {
  const firstCropOrderDataList =
    await this.findCropDataByFieldIDAndYearToSoilAnalysisYear(
      fieldId,
      cropData.Year - 1,
      soilAnalysisYear,
      1,
    );
  const totalLime = firstCropOrderDataList
    ? await this.getApplyLimeInCaseOfMultipleCrops(firstCropOrderDataList)
    : 0;

  console.log(`Total Lime from all firstCropOrderData: ${totalLime}`);
  return totalLime;
},

async getSecondCropOrderLime(fieldId, cropData, soilAnalysisYear) {
  const previousCropOrderLime =
    await fieldSoilRecommendationMethods.getPreviousCropOrderLime.call(
      this,
      fieldId,
      cropData,
      soilAnalysisYear,
    );
  const firstCropOrderLime =
    await fieldSoilRecommendationMethods.getCurrentFirstCropOrderLime.call(
      this,
      fieldId,
      cropData,
    );

  return previousCropOrderLime + firstCropOrderLime;
},

async getPreviousCropOrderLime(fieldId, cropData, soilAnalysisYear) {
  const cropOrderDataList =
    await this.findCropDataByFieldIDAndYearToSoilAnalysisYear(
      fieldId,
      cropData.Year - 1,
      soilAnalysisYear,
    );

  return cropOrderDataList
    ? this.getApplyLimeInCaseOfMultipleCrops(cropOrderDataList)
    : 0;
},

async getCurrentFirstCropOrderLime(fieldId, cropData) {
  const cropOrder = 1;
  const firstCropOrderData =
    await this.findCropDataByFieldIDAndYearToSoilAnalysisYear(
      fieldId,
      cropData.Year,
      null,
      cropOrder,
    );

  return firstCropOrderData
    ? this.getApplyLimeInCaseOfMultipleCrops(firstCropOrderData)
    : 0;
},

async findCropDataByID(CropID) {
  // Ensure the managementPeriodID is provided
  if (!CropID) {
    console.error("CropID is required");
  }

  // Find the ManagementPeriod by the provided ManagementPeriodID
  const cropData = await this.cropRepository.findOne({
    where: {
      ID: CropID,
    },
  });

  // Check if management period data is found
  if (!cropData) {
    return 0;
  }

  // Return the associated crop data
  return cropData;
},

async findCropDataByFieldIDAndYearToSoilAnalysisYear(
  fieldID,
  year,
  soilAnalysisYear = null,
  cropOrder = null,
) {
  // Ensure both fieldID and year are provided
  if (!fieldID || !year) {
    console.log("FieldID and Year are required");
    return null;
  }

  // Build the query object
  const query = {
    where: {
      FieldID: fieldID, // FieldID is required
      Year: year, // Default Year filter (exact year match)
    },
  };

  // If cropOrder is provided, include it in the query
  if (cropOrder) {
    query.where.CropOrder = cropOrder;
  }

  // If soilAnalysisYear 2024 is provided, adjust the query to include years up to soilAnalysisYear
  //Harvestyear 2024
  if (soilAnalysisYear) {
    if (year > soilAnalysisYear) {
      query.where.Year = Between(soilAnalysisYear, year); // Include years between `year` and `soilAnalysisYear`
    } else if (year === soilAnalysisYear) {
      query.where.Year = Between(year, soilAnalysisYear); // Include years between `year` and `soilAnalysisYear`
    } else if (year < soilAnalysisYear) {
      return null;
    } else{return null}
  }

  // Determine whether to use `findOne` or `find` based on the provided parameters
  if (!soilAnalysisYear && cropOrder) {
    // If only fieldID, year, and cropOrder are provided, return a single result using findOne
    const cropByFieldAndYear = await this.cropRepository.findOne(query);
    return cropByFieldAndYear;
  } else {
    // If soilAnalysisYear is provided, return all crop data between year and soilAnalysisYear
    const cropDataList = await this.cropRepository.find(query);

    return cropDataList.length > 0 ? cropDataList : null;
  }
},

async findAndSumFertiliserManuresByManagementPeriodID(managementPeriodID) {
  // Ensure the managementPeriodID is provided
  if (!managementPeriodID) {
    console.log("ManagementPeriodID is required");
  }

  // Fetch all fertiliser manures data for the given ManagementPeriodID
  const fertiliserManures = await this.fertiliserManureRepository.find({
    where: {
      ManagementPeriodID: managementPeriodID,
    },
    select: {
      Lime: true, // Only select the Lime field
    },
  });

  // Check if any fertiliser manures data is found
  if (!fertiliserManures || fertiliserManures.length === 0) {
    console.log(
      `No fertiliser manures data found for ManagementPeriodID ${managementPeriodID}`,
    );
    return 0; // Exit if no fertiliser data is found
  }

  // Sum up the Lime values from the list of fertiliser manures data
  const totalLime = fertiliserManures.reduce((total, item) => {
    return total + (item.Lime || 0); // Add Lime value if available, otherwise 0
  }, 0);

  // Return the total sum of Lime
  return totalLime;
},

async getApplyLimeInCaseOfMultipleCrops(cropDataList) {
  let totalLime = 0; // Initialize total lime to 0

  // Ensure cropDataList is an array, if it's not, wrap it in an array
  const cropsToProcess = Array.isArray(cropDataList)
    ? cropDataList
    : [cropDataList];

  // Loop through each crop in the cropsToProcess (which is always an array)
  for (const cropData of cropsToProcess) {
    // Fetch the ManagementPeriod data for the current crop
    const previousManagementPeriodData =
      await this.findManagementPeriodByCropID(cropData.ID);

    // Fetch and sum the total lime for the current management period
    const limeForThisManagementPeriod =
      await this.findAndSumFertiliserManuresByManagementPeriodID(
        previousManagementPeriodData.ID,
      );

    // Accumulate the lime value
    totalLime += limeForThisManagementPeriod;
  }

  return totalLime; // Return the total lime value
},

async findManagementPeriodByCropID(CropID) {
  // Ensure the managementPeriodID is provided
  if (!CropID) {
    console.error("CropID is required");
  }

  // Find the ManagementPeriodData by the provided ManagementPeriodID
  const managementPeriodData = await this.managementPeriodRepository.findOne({
    where: {
      CropID: CropID,
    },
  });

  // Return the ManagementPeriodData or null if not found
  return managementPeriodData || null;
}
};

module.exports = { fieldSoilRecommendationMethods };
