const { Between } = require("typeorm");

const recommendationSoilMethods = {
async findManagementPeriodByID(ManagementPeriodID) {
  // Ensure the managementPeriodID is provided
  if (!ManagementPeriodID) {
    console.error("ManagementPeriodID is required");
  }

  // Find the ManagementPeriodData by the provided ManagementPeriodID
  const managementPeriodData = await this.managementPeriodRepository.findOne({
    where: {
      ID: ManagementPeriodID,
    },
  });

  // Return the ManagementPeriodData or null if not found
  return managementPeriodData || null;
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
  cropOrder = null
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
    if (year >= soilAnalysisYear) {
      query.where.Year = Between(soilAnalysisYear, year); // Include years between `year` and `soilAnalysisYear`
    } else if (year < soilAnalysisYear) {
      return null;
    }else {console.log("Invalid year and soilAnalysisYear combination")}
  }

  // Determine whether to use `findOne` or `find` based on the provided parameters
  if (!soilAnalysisYear && cropOrder) {
    // If only fieldID, year, and cropOrder are provided, return a single result using findOne
    const cropDatabyFieldAndYear = await this.cropRepository.findOne(query);
    return cropDatabyFieldAndYear;
  } else {
    // If soilAnalysisYear is provided, return all crop data between year and soilAnalysisYear
    const cropDataList = await this.cropRepository.find(query);
    console.log("cropDataList", cropDataList);
    return cropDataList.length > 0 ? cropDataList : null;
  }
},

async findAndSumFertiliserManuresByManagementPeriodID(managementPeriodID) {
  // Ensure the managementPeriodID is provided
  if (!managementPeriodID) {
    console.log("ManagementPeriodID is required");
  }

  // Fetch all fertiliser manures data for the given ManagementPeriodID
  const fertiliserManures = await this.fertiliserManuresRepository.find({
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
      `No fertiliser manures data found for ManagementPeriodID ${managementPeriodID}`
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
        previousManagementPeriodData.ID
      );
    console.log("limeForThisManagementPeriod", limeForThisManagementPeriod);
    // Accumulate the lime value
    totalLime += limeForThisManagementPeriod;
  }

  return totalLime; // Return the total lime value
},

async calculateFirstCropPreviousLime(fieldId, cropData, soilAnalysisYear) {
  const firstCropOrderDataList =
    await this.findCropDataByFieldIDAndYearToSoilAnalysisYear(
      fieldId,
      cropData.Year - 1,
      soilAnalysisYear,
      1
    );

  if (firstCropOrderDataList == null) {
    return 0;
  }

  const totalLime = await this.getApplyLimeInCaseOfMultipleCrops(
    firstCropOrderDataList
  );
  console.log(`Total Lime from all firstCropOrderData: ${totalLime}`);
  return totalLime;
},

async calculateSecondCropPreviousLime(fieldId, cropData, soilAnalysisYear) {
  const cropOrderDataList =
    await this.findCropDataByFieldIDAndYearToSoilAnalysisYear(
      fieldId,
      cropData.Year - 1,
      soilAnalysisYear
    );
  const priorCropLime = cropOrderDataList == null
    ? 0
    : await this.getApplyLimeInCaseOfMultipleCrops(cropOrderDataList);
  const firstCropOrderData =
    await this.findCropDataByFieldIDAndYearToSoilAnalysisYear(
      fieldId,
      cropData.Year,
      null,
      1
    );

  if (firstCropOrderData == null) {
    return priorCropLime;
  }

  console.log("CropOrderDataList", firstCropOrderData);
  return (
    priorCropLime +
    await this.getApplyLimeInCaseOfMultipleCrops(firstCropOrderData)
  );
},

async calculatePreviousAppliedLime(fieldId, cropData, soilAnalysisYear) {
  if (cropData.CropOrder === 1) {
    return this.calculateFirstCropPreviousLime(
      fieldId,
      cropData,
      soilAnalysisYear
    );
  }

  if (cropData.CropOrder === 2) {
    return this.calculateSecondCropPreviousLime(
      fieldId,
      cropData,
      soilAnalysisYear
    );
  }

  return 0;
},

getPreviousAppliedLimeRecommendation(cropNeedValue, totalLime) {
  if (totalLime <= 0) {
    return 0;
  }

  return Math.max(cropNeedValue - totalLime, 0);
},

async processSoilRecommendations(harvestYear, fieldId, Recommendation) {
  try {
    const fiveYears = 5;
    const currentYear = harvestYear;
    const fiveYearsAgo = currentYear - fiveYears;
    // Step 1: Fetch soil recommendations (before fertiliser apply)
    const soilAnalyses = await this.soilAnalysisRepository.find({
      where: {
        FieldID: fieldId,
        Year: Between(fiveYearsAgo, currentYear),
      },
    });

    // Step 2: Check if any year has pH value > 0
    const soilAnalysisWithPH = soilAnalyses.find((rec) => rec.PH > 0);

    // If no pH > 0 is found, return early without doing any further processing
    if (!soilAnalysisWithPH) {
      return null; // Exit if no recommendation with pH > 0 is found
    }
    // Get the soilAnalysisYear from the recommendation with pH > 0
    const soilAnalysisWithPhYear = soilAnalysisWithPH.Year;
    // Step 3: Proceed with the process only if pH > 0 is found
    const cropData = await this.findCropDataByID(Recommendation.Crop_ID); // check order 1 or 2

    if (cropData == null) {
      return 0;
    }

    const totalLime = await this.calculatePreviousAppliedLime(
      fieldId,
      cropData,
      soilAnalysisWithPhYear
    );
    const cropNeedValue = Recommendation.Recommendation_CropN;
    console.log("cropNeedValue", cropNeedValue);
    return this.getPreviousAppliedLimeRecommendation(cropNeedValue, totalLime);
  } catch (error) {
    console.error("Error in processSoilRecommendations:", error);
    throw error;
  }
}
};

module.exports = { recommendationSoilMethods };
