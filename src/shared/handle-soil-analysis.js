const { Between } = require("typeorm");
const RB209SoilService = require("../vendors/rb209/soil/soil.service");
const { AppDataSource } = require("../db/data-source");
const { SoilAnalysisEntity } = require("../db/entity/soil-analysis.entity");
const { NutrientMapperNames } = require("../constants/nutrient-mapper-names");
const { CountryMapper } = require("../constants/country-mapper");
const { MethodologyMapper } = require("../constants/methodology-mapper");
const NUTRIENT_IDS = {
  PHOSPHORUS: 1,
  POTASSIUM: 2,
  MAGNESIUM: 3,
};

const MAX_SOIL_ANALYSIS_RECORDS = 8;
const REQUIRED_NUTRIENTS = ["PhosphorusIndex", "PotassiumIndex", "MagnesiumIndex"];

class HandleSoilAnalysisService {
  constructor() {
    this.RB209SoilService = new RB209SoilService();
    this.soilAnalysisRepository =
      AppDataSource.getRepository(SoilAnalysisEntity);
  }

  getIndexString(nutrient, indexValue) {
    const minusTwo = -2;
    const plusTwo = 2;

    if (indexValue === null) {
      return null;
    }

    if (nutrient === "Potassium") {
      if (indexValue === plusTwo) {
        return "2+";
      }
      if (indexValue === minusTwo) {
        return "2-";
      }
    }

    return indexValue.toString();
  }

  async findIndexId(nutrient, indexValue, nutrientIndicesData) {
    const indexString = this.getIndexString(nutrient, indexValue);
    if (indexString === null) {
      return null;
    }

    const nutrientData = nutrientIndicesData[nutrient] || [];
    const matchedIndex = nutrientData.find(
      (data) => data.index.trim() === indexString,
    );

    return matchedIndex ? matchedIndex.indexId : null;
  }

  async assignIndexIdToSoilRecords(soilAnalysisRecords, rb209CountryId) {
    for (const record of soilAnalysisRecords) {
      await this.processRecord(record, rb209CountryId);
    }

    return soilAnalysisRecords;
  }

  /* -----------------------------
   PROCESS SINGLE RECORD
------------------------------*/
  async processRecord(record, rb209CountryId) {
    const cache = {};
    for (const nutrient of NutrientMapperNames) {
      const { nutrientId, nutrient: nutrientName } = nutrient;

      const methodologyId = this.getMethodologyId(record, nutrientId);
      if (methodologyId == null) {
        continue;
      }

      const nutrientIndexKey = this.getNutrientIndexKey(
        nutrientName,
        methodologyId,
      );

      if (nutrientIndexKey in record) {
        await this.getNutrientIndexData(
          nutrientId,
          methodologyId,
          rb209CountryId,
          nutrientName,
          cache,
        );

        const nutrientIndexId = await this.findIndexId(
          nutrientName,
          record[nutrientIndexKey],
          cache,
        );
        record[nutrientIndexKey] = nutrientIndexId || record[nutrientIndexKey];
      }
    }
  }

  /* -----------------------------
   CACHE + API HANDLER
------------------------------*/
  async getNutrientIndexData(
    nutrientId,
    methodologyId,
    rb209CountryId,
    nutrientName,
    cache,
  ) {
    const cacheKey = nutrientName;
    if (!cache[cacheKey]) {
      cache[cacheKey] = await this.RB209SoilService.getData(
        `Soil/NutrientIndices/${nutrientId}/${methodologyId}/${rb209CountryId}`,
      );
    }

    return cache[cacheKey];
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
    const methodologyName = methodologyId === MethodologyMapper.SACMETHODOLOGY || methodologyId === MethodologyMapper.RB209MTHODOLOGY ? `${nutrientName}Status` : `${nutrientName}Index`;
    return methodologyName;
  }

  /* --------------------------------
     FILTER AND LIMIT SOIL ANALYSIS RECORDS
  --------------------------------*/
  getLatestNutrientRecords(soilAnalysisRecords) {
    const latestRecords = new Map();

    for (const nutrient of REQUIRED_NUTRIENTS) {
      const latestRecord = soilAnalysisRecords.find((record) => {
        const nutrientValue = record[nutrient];
        return nutrientValue !== null && nutrientValue !== undefined;
      });

      if (latestRecord) {
        latestRecords.set(nutrient, latestRecord);
      }
    }

    return latestRecords;
  }

  getUniqueLatestRecords(latestNutrientRecords) {
    const uniqueRecords = new Map();

    for (const record of latestNutrientRecords.values()) {
      if (record.id && !uniqueRecords.has(record.id)) {
        uniqueRecords.set(record.id, record);
      }
    }

    return uniqueRecords;
  }

  addRemainingRecords(resultRecords, soilAnalysisRecords, uniqueRecordIds) {
    for (const record of soilAnalysisRecords) {
      if (resultRecords.length >= MAX_SOIL_ANALYSIS_RECORDS) {
        break;
      }

      if (!uniqueRecordIds.has(record.id)) {
        resultRecords.push(record);
      }
    }
  }

  filterAndLimitSoilAnalysisRecords(soilAnalysisRecords) {
    if (!soilAnalysisRecords || soilAnalysisRecords.length === 0) {
      return soilAnalysisRecords;
    }

    const latestNutrientRecords = this.getLatestNutrientRecords(
      soilAnalysisRecords,
    );
    const uniqueLatestRecords = this.getUniqueLatestRecords(
      latestNutrientRecords,
    );

    const resultRecords = Array.from(uniqueLatestRecords.values());
    this.addRemainingRecords(
      resultRecords,
      soilAnalysisRecords,
      uniqueLatestRecords,
    );

    return resultRecords;
  }

  async handleSoilAnalysisValidation(
    fieldId,
    year,
    rb209CountryId,
    transactionalManager,
  ) {
    const errors = [];
    const fiveYearsAgo = year - 4;

    // Fetch all soil analyses for the last 5 years
    const soilAnalysisRecordsFiveYears = await transactionalManager.find(
      SoilAnalysisEntity,
      {
        where: {
          FieldID: fieldId,
          Year: Between(fiveYearsAgo, year), // Fetch records within 5 years
        },
        order: { Date: "DESC" }, // Order by date, most recent first
      },
    );

    // Define the fields we want the latest values for
    const fieldsToTrack = [
      "PH",
      "SoilNitrogenSupplyIndex",
      "PhosphorusIndex",
      "PotassiumIndex",
      "MagnesiumIndex",
      "PotassiumMethodologyID",
      "PhosphorusMethodologyID",
      "MagnesiumMethodologyID",
      "PotassiumStatus",
      "PhosphorusStatus",
      "MagnesiumStatus"
    ];

    // Initialize the latest values object
    const latestSoilAnalysis = {};
    if (soilAnalysisRecordsFiveYears.length > 0) {
      fieldsToTrack.forEach((field) => {
        latestSoilAnalysis[field] = null;

        // Find the first record in descending date order where the field has a value
        const latestRecordWithFieldValue = soilAnalysisRecordsFiveYears.find(
          (record) => record[field] !== null && record[field] !== undefined,
        );
        if (latestRecordWithFieldValue) {
          latestSoilAnalysis[field] = latestRecordWithFieldValue[field];
        } else {
          // Explicitly set the field to null if no value was found
          latestSoilAnalysis[field] = null;
        }
      });
    }

    let soilAnalysisRecords = await this.assignIndexIdToSoilRecords(
      soilAnalysisRecordsFiveYears,
      rb209CountryId,
    );

    // Filter and limit records to get latest nutrients data
    soilAnalysisRecords = this.filterAndLimitSoilAnalysisRecords(
      soilAnalysisRecords,
    );

    return { latestSoilAnalysis, errors, soilAnalysisRecords };
  }
}

module.exports = { HandleSoilAnalysisService };
