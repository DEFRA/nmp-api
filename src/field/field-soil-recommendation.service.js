const { Between } = require("typeorm");

const fieldSoilRecommendationMethods = {
async processSoilRecommendations(harvestYear, fieldId, Recommendation) {
  const fiveYearBack = 5;
  try {
    const currentYear = harvestYear;
    const fiveYearsAgo = currentYear - fiveYearBack;

    // Step 1: Fetch soil recommendations (before fertiliser apply)
    const soilAnalyses = await this.soilAnalysisRepository.find({
      where: {
        FieldID: fieldId,
        Year: Between(fiveYearsAgo, currentYear),
      },
    });

    // Step 2: Check if any year has pH value > 0
    const soilAnalysisWithPH = soilAnalyses.find((rec) => rec.PH > 0);
    if (!soilAnalysisWithPH) { return null}
    // Get the soilAnalysisYear from the recommendation with pH > 0
    const soilAnalysisWithPhYear = soilAnalysisWithPH.Year;
    const cropData = await this.findCropDataByID(Recommendation.Crop_ID); // check order 1 or 2
    let totalLime1 = 0;
    let result = 0;
    if (cropData != null) {
      // Step 4: Handle CropOrder 1 (first crop)
      if (cropData.CropOrder === 1) {
        // Step: Fetch multiple firstCropOrderData based on fieldID, year, and soilAnalysisYear
        const firstCropOrderDataList =
          await this.findCropDataByFieldIDAndYearToSoilAnalysisYear(
            fieldId,
            cropData.Year - 1,
            soilAnalysisWithPhYear,
            1,
          );

        if (firstCropOrderDataList != null) {
          totalLime1 = await this.getApplyLimeInCaseOfMultipleCrops(
            firstCropOrderDataList,
          );
        }
        console.log(`Total Lime from all firstCropOrderData: ${totalLime1}`);
      }

      // Step 5: Handle CropOrder 2 (second crop)
      if (cropData.CropOrder === 2) {
        totalLime1 = 0;
        const CropOrderDataList =
          await this.findCropDataByFieldIDAndYearToSoilAnalysisYear(
            fieldId,
            cropData.Year - 1,
            soilAnalysisWithPhYear,
          );

        if (CropOrderDataList != null) {
          totalLime1 = await this.getApplyLimeInCaseOfMultipleCrops(CropOrderDataList);
        }
        const cropOrder = 1;
        const firstCropOrderData =
          await this.findCropDataByFieldIDAndYearToSoilAnalysisYear(
            fieldId,
            cropData.Year,
            null,
            cropOrder
          );
        if (firstCropOrderData != null) {
          totalLime1 += await this.getApplyLimeInCaseOfMultipleCrops(firstCropOrderData);
        }
      }
      const cropNeedValue = Recommendation.Recommendation_CropN;
      if (totalLime1 > 0) {
        result = cropNeedValue - totalLime1;
        console.log("result", result);
      }
    }
    // Return the result of the calculation
    if (result < 0) {
      return 0;
    } else {
      return result;
    }
  } catch (error) {
    console.error("Error in processSoilRecommendations:", error);
    throw error;
  }
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
