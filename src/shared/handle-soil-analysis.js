const {  Between } = require("typeorm");
const RB209SoilService = require("../vendors/rb209/soil/soil.service");
const { AppDataSource } = require("../db/data-source");
const { SoilAnalysisEntity } = require("../db/entity/soil-analysis.entity");
const { NutrientMapperNames } = require("../constants/nutrient-mapper-names");
const { CountryMapper } = require("../constants/country-mapper");
const NUTRIENT_IDS = {
  PHOSPHORUS: 1,
  POTASSIUM: 2,
  MAGNESIUM: 3
};

class HandleSoilAnalysisService {
  constructor() {
    this.RB209SoilService = new RB209SoilService();
     this.soilAnalysisRepository = AppDataSource.getRepository(SoilAnalysisEntity);
  }


  async findIndexId(nutrient, indexValue, nutrientIndicesData) {
    // Return null immediately if indexValue is null
    if (indexValue === null) {
      return null;
    }
    const nutrientData = nutrientIndicesData[nutrient];

    // Special case for Potassium (nutrientId = 2)
    if (nutrient === "Potassium") {
      // Check if indexValue is 2 and match with "2+"
      if (indexValue === 2) {
        for (const data of nutrientData) {
          if (data.index.trim() === "2+") {
            return data.indexId;
          }
        }
      }
      // Check if indexValue is -2 and match with "2-"
      if (indexValue === -2) {
        for (const data of nutrientData) {
          if (data.index.trim() === "2-") {
            return data.indexId;
          }
        }
      }
    }
    for (const data of nutrientData) {
      if (data.index.trim() === indexValue.toString()) {
        return data.indexId;
      }
    }
    return null; // Return null if no match is found
  }

  async assignIndexIdToSoilRecords(soilAnalysisRecords, rb209CountryId) {
  const nutrientIndicesCache = {};

  for (const record of soilAnalysisRecords) {
    for (const nutrient of NutrientMapperNames) {
      const { nutrientId, nutrient: nutrientName } = nutrient;

      const methodologyId = this.getMethodologyId(record, nutrientId);
      
         const cacheKey =nutrientName;

      // cache API response
      if (!nutrientIndicesCache[cacheKey]&&methodologyId != null) {
        nutrientIndicesCache[cacheKey] =
          await this.RB209SoilService.getData(
            `Soil/NutrientIndices/${nutrientId}/${methodologyId}/${rb209CountryId}`
          );
      

      const nutrientIndexKey = this.getNutrientIndexKey(
        nutrientName,
        methodologyId
      );

      if (record[nutrientIndexKey] === undefined) continue;

      const nutrientIndexId = await this.findIndexId(
        nutrientName,
        record[nutrientIndexKey],
        nutrientIndicesCache
      );

      record[nutrientIndexKey] =
        nutrientIndexId || record[nutrientIndexKey];
    }

     
    }
  }

  return soilAnalysisRecords;
}

 getMethodologyId(record, nutrientId) {
  switch (nutrientId) {
    case NUTRIENT_IDS.PHOSPHORUS:
      return record.PhosphorusMethodologyID;

    case NUTRIENT_IDS.POTASSIUM:
      return record.PotassiumMethodologyID;

    case NUTRIENT_IDS.MAGNESIUM:
      return record.MagnesiumMethodologyID;

    default:
      return null;
  }
}

getNutrientIndexKey(nutrientName, methodologyId) {
  return methodologyId === 2
    ? `${nutrientName}Status`
    : `${nutrientName}Index`;
}
  async handleSoilAnalysisValidation(fieldId, year, rb209CountryId,transactionalManager) {
    const errors = [];
    const fiveYearsAgo = year - 4;

    // Fetch all soil analyses for the last 5 years
    const soilAnalysisRecordsFiveYears = await transactionalManager.find(SoilAnalysisEntity,
      {
        where: {
          FieldID: fieldId,
          Year: Between(fiveYearsAgo, year), // Fetch records within 5 years
        },
        order: { Date: "DESC" } // Order by date, most recent first
      }
    );

    // Define the fields we want the latest values for
    const fieldsToTrack = [
      "PH",
      "SoilNitrogenSupplyIndex",
      "PhosphorusIndex",
      "PotassiumIndex",
      "MagnesiumIndex"
    ];

    // Initialize the latest values object
    const latestSoilAnalysis = {};
    if (soilAnalysisRecordsFiveYears.length > 0) {
      fieldsToTrack.forEach((field) => {
        latestSoilAnalysis[field] = null;

        // Find the first record in descending date order where the field has a value
        const latestRecordWithFieldValue = soilAnalysisRecordsFiveYears.find(
          (record) => record[field] !== null && record[field] !== undefined
        );
        if (latestRecordWithFieldValue) {
          latestSoilAnalysis[field] = latestRecordWithFieldValue[field];
        } else {
          // Explicitly set the field to null if no value was found
          latestSoilAnalysis[field] = null;
        }
      });
    }
    // Iterate over the fields and find the latest value for each field

    const soilAnalysisRecords = await this.assignIndexIdToSoilRecords(
      soilAnalysisRecordsFiveYears,
      rb209CountryId
    );

    return { latestSoilAnalysis, errors, soilAnalysisRecords };
  }
}

module.exports = { HandleSoilAnalysisService };
