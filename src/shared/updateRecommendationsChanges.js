const { In, Between, Not, MoreThan } = require("typeorm");
const { AppDataSource } = require("../db/data-source");
const {
  CropTypeLinkingEntity,
} = require("../db/entity/crop-type-linking.entity");
const { CropEntity } = require("../db/entity/crop.entity");
const { FarmEntity } = require("../db/entity/farm.entity");
const { FieldEntity } = require("../db/entity/field.entity");
const {
  ManagementPeriodEntity,
} = require("../db/entity/management-period.entity");
const boom = require("@hapi/boom");
const { OrganicManureEntity } = require("../db/entity/organic-manure.entity");
const { PKBalanceEntity } = require("../db/entity/pk-balance.entity");
const { SnsAnalysesEntity } = require("../db/entity/sns-analysis.entity");
const { SoilAnalysisEntity } = require("../db/entity/soil-analysis.entity");
const MannerCalculateNutrientsService = require("../vendors/manner/calculate-nutrients/calculate-nutrients.service");
const MannerManureTypesService = require("../vendors/manner/manure-types/manure-types.service");
const RB209ArableService = require("../vendors/rb209/arable/arable.service");
const {
  RB209RecommendationService,
} = require("../vendors/rb209/recommendation/recommendation.service");
const { RecommendationEntity } = require("../db/entity/recommendation.entity");
const {
  RecommendationCommentEntity,
} = require("../db/entity/recommendation-comment.entity");
const {
  FertiliserManuresEntity,
} = require("../db/entity/fertiliser-manures.entity");
const { NutrientsMapper } = require("../constants/nutrient-mapper");
const {
  InprogressCalculationsEntity,
} = require("../db/entity/inprogress-calculations-entity");
const {
  SoilTypeSoilTextureEntity,
} = require("../db/entity/soil-type-soil-texture.entity");
const { CountryEntity } = require("../db/entity/country.entity");
const RB209SoilService = require("../vendors/rb209/soil/soil.service");
const { NutrientMapperNames } = require("../constants/nutrient-mapper-names");
const {
  ExcessRainfallsEntity,
} = require("../db/entity/excess-rainfalls.entity");
const { GrassGrowthService } = require("../grass-growth-plan/grass-growth-plan.service");
const { CalculateGrassHistoryAndPreviousGrass } = require("./calculate-previous-grass-id.service");
const { CropTypeMapper } = require("../constants/crop-type-mapper");
const { CropOrderMapper } = require("../constants/crop-order-mapper");
const { FieldTypeMapper } = require("../constants/field-type-mapper");
const { CalculateMannerOutputService } = require("./calculate-manner-output-service");
const { CalculateTotalAvailableNForNextYear } = require("./calculate-next-year-available-n");
const { CalculateNextDefoliationService } = require("./calculate-next-defoliation-totalN");
const { CalculatePKBalanceOther } = require("./calculate-pk-balance-other");
const { PreviousCroppingEntity } = require("../db/entity/previous-cropping.entity");
const { CalculatePreviousCropService } = require("./previous-year-crop-service");
const { FieldAboveOrBelowSeaLevelMapper } = require("../constants/field-is-above-sea-level");
const { StaticStrings } = require("./static.string");


class UpdateRecommendationChanges {
  constructor() {
    this.RecommendationRepository =
      AppDataSource.getRepository(RecommendationEntity);
    this.pkBalanceRepository = AppDataSource.getRepository(PKBalanceEntity);
    this.cropRepository = AppDataSource.getRepository(CropEntity);

    this.CropTypeLinkingRepository = AppDataSource.getRepository(
      CropTypeLinkingEntity
    );
    this.managementPeriodRepository = AppDataSource.getRepository(
      ManagementPeriodEntity
    );

    this.organicManureRepository =
      AppDataSource.getRepository(OrganicManureEntity);
    this.rB209ArableService = new RB209ArableService();

    this.MannerManureTypesService = new MannerManureTypesService();
    this.rB209RecommendationService = new RB209RecommendationService();
    this.RB209SoilService = new RB209SoilService();

    this.fieldRespository = AppDataSource.getRepository(FieldEntity);
    this.farmRespository = AppDataSource.getRepository(FarmEntity);
    this.countryRepository = AppDataSource.getRepository(CountryEntity);
    this.MannerCalculateNutrientsService =
      new MannerCalculateNutrientsService();
    this.CalculateMannerOutput = new CalculateMannerOutputService();
    this.snsAnalysisRepository = AppDataSource.getRepository(SnsAnalysesEntity);
    this.soilAnalysisRepository =
      AppDataSource.getRepository(SoilAnalysisEntity);
    this.recommendationCommentRepository = AppDataSource.getRepository(
      RecommendationCommentEntity
    );
    this.fertiliserRepository = AppDataSource.getRepository(
      FertiliserManuresEntity
    );

    this.farmExistRepository = AppDataSource.getRepository(
      InprogressCalculationsEntity
    );
    this.soilTypeTextureRepository = AppDataSource.getRepository(
      SoilTypeSoilTextureEntity
    );
    this.excessRainfallRepository = AppDataSource.getRepository(
      ExcessRainfallsEntity
    );
    this.grassGrowthClass = new GrassGrowthService();
    this.calculateGrassId = new CalculateGrassHistoryAndPreviousGrass();
    this.CalculateTotalAvailableNForPreviousYear =
      new CalculateTotalAvailableNForNextYear();
    this.CalculateNextDefoliationService =
      new CalculateNextDefoliationService();
    this.CalculatePKBalanceOther = new CalculatePKBalanceOther();
    this.CalculatePreviousCropService = new CalculatePreviousCropService();
  }

  async getYearsGreaterThanGivenYear(fieldID, year) {
    const years = await this.cropRepository.find({
      where: {
        FieldID: fieldID,
        Year: MoreThan(year), // Fetch records with Year greater than the provided year
      },
      select: ["Year"],
    });

    // Extract and return unique years
    return years.map((record) => record.Year);
  }

  async processSingleYear(fieldID, year, request, userId) {
    try {
      const existingEntry = await this.farmExistRepository.findOne({
        where: { FieldID: fieldID, Year: year },
      });

      if (!existingEntry) {
        await this.farmExistRepository.save({ FieldID: fieldID, Year: year });
        console.log(`Saved entry for FieldID: ${fieldID}, Year: ${year}`);
      } else {
        console.log(
          `Entry for FieldID: ${fieldID}, Year: ${year} already exists`
        );
      }

      await this.updateRecommendationAndOrganicManure(
        fieldID,
        year,
        request,
        userId
      );
      console.log(`Successfully processed year ${year}`);
    } catch (error) {
      console.error(`Error processing year ${year}:`, error);
    }
  }

  async updateRecommendationsForField(fieldID, year, request, userId) {
    // ✅ Do not await, run current year in background too
    setImmediate(async () => {
      try {
        await this.processSingleYear(fieldID, year, request, userId);
      } catch (error) {
        console.error(
          `Error in processing single year ${year} for field ${fieldID}:`,
          error
        );
      }

      try {
        const yearsGreaterThanGivenYear =
          await this.getYearsGreaterThanGivenYear(fieldID, year);

        this.processRemainingYearsInBackground(
          fieldID,
          yearsGreaterThanGivenYear,
          request,
          userId
        );
      } catch (err) {
        console.error("Error fetching or processing future years:", err);
      }
    });
  }

  async processRemainingYearsInBackground(fieldID, years, request, userId) {
    for (const yearToSave of years) {
      try {
        // Check if FieldID and Year combination already exists
        const existingEntry = await this.farmExistRepository.findOne({
          where: { FieldID: fieldID, Year: yearToSave },
        });

        // If it doesn't exist, save it
        if (!existingEntry) {
          await this.farmExistRepository.save({
            FieldID: fieldID,
            Year: yearToSave,
          });
          console.log(
            `Saved entry for FieldID: ${fieldID}, Year: ${yearToSave}`
          );
        } else {
          console.log(
            `Entry for FieldID: ${fieldID}, Year: ${yearToSave} already exists`
          );
        }
      } catch (error) {
        console.error(
          `Error saving entry for FieldID: ${fieldID}, Year: ${yearToSave}`,
          error
        );
      }
    }

    // If there are remaining years, process them in the background
    if (years.length > 0) {
      console.log("Processing the following years in background:", years);
      for (const yearToUpdate of years) {
        try {
          // Call the updateRecommendationAndOrganicManure for each remaining year
          await this.updateRecommendationAndOrganicManure(
            fieldID,
            yearToUpdate,
            request,
            userId
          );
          console.log(`Successfully processed year ${yearToUpdate}`);
        } catch (error) {
          console.error(`Error processing year ${yearToUpdate}:`, error);
        }
      }
    } else {
      console.log("No years greater than the given year were found.");
    }
  }

  async updateRecommendationAndOrganicManure(
    fieldID,
    year,
    request,
    userId,
    transactionalManager
  ) {
    const allCropData = await transactionalManager.find(CropEntity, {
      where: { FieldID: fieldID },
    });
    const cropTypesList = await this.rB209ArableService.getData(
      "/Arable/CropTypes"
    );
    const allCropIds = allCropData.map((crop) => crop.ID);
    const allManagementPeriods = await this.getManagementPeriods(
      transactionalManager,
      allCropIds
    );
    const allManagementPeriodIDs = allManagementPeriods.map((mp) => mp.ID);
    const organicManureAllData = await this.getOrganicManures(
      allManagementPeriods,
      transactionalManager
    );
    const crops = allCropData?.filter((crop) => crop.Year === year);

    if (crops.length > 0) {
      const cropIds = crops.map((crop) => crop.ID);
      const managementPeriods = allManagementPeriods?.filter((mp) =>
        cropIds.includes(mp.CropID)
      );
      const managementPeriodIDs = managementPeriods?.map((mp) => mp.ID);

      if (managementPeriods.length === 0) {
        throw new Error("No Management Periods found for the selected crops");
      }

      const organicManures = organicManureAllData?.filter((om) =>
        managementPeriodIDs.includes(om.ManagementPeriodID)
      );

      const allRecommendations = await transactionalManager.find(
        RecommendationEntity,
        {
          where: {
            ManagementPeriodID: In(allManagementPeriodIDs),
          },
        }
      );
      if (organicManures.length > 0) {
        await this.saveRecommendationWithManure(
          organicManures,
          organicManureAllData,
          allCropData,
          allManagementPeriods,
          managementPeriods,
          request,
          fieldID,
          transactionalManager,
          userId,
          allRecommendations,
          year,
          cropTypesList
        );
      } else {
        await this.saveRecommendationWithoutManure(
          crops,
          organicManures,
          organicManureAllData,
          allManagementPeriods,
          request,
          fieldID,
          transactionalManager,
          userId,
          allRecommendations,
          year,
          cropTypesList
        );
      }

      await this.farmExistRepository.delete({
        FieldID: fieldID,
        Year: year,
      });
    }
  }

  async saveMultipleRecommendationForManure(
    Recommendations,
    savedCrop,
    cropSaveData,
    transactionalManager,
    nutrientRecommendationsData,
    userId
  ) {
    const RecommendationComments = [];

    // Separate advice notes by sequenceId for crop (sequenceId = croporder)
    const cropNotes = nutrientRecommendationsData?.adviceNotes?.filter(
      (note) => note.sequenceId === savedCrop.CropOrder
    );

    // Helper function to group notes by nutrientId and concatenate them
    const groupNotesByNutrientId = (notes) => {
      return notes.reduce((acc, adviceNote) => {
        const nutrientId = adviceNote.nutrientId;
        if (!acc[nutrientId]) {
          acc[nutrientId] = [];
        }
        acc[nutrientId].push(adviceNote.note); // Group notes by nutrientId
        return acc;
      }, {});
    };

    const cropNotesByNutrientId = groupNotesByNutrientId(cropNotes);
    //const secondCropNotesByNutrientId = groupNotesByNutrientId(secondCropNotes);

    // Track nutrient IDs that are being processed
    const nutrientIdsInData = [];

    // Function to handle saving comments (with updates or creations)
    const saveComments = async (notesByNutrientId, savedCrop) => {
      const existingComments = await transactionalManager.find(
        RecommendationCommentEntity,
        { where: { RecommendationID: savedCrop.ID } }
      );

      for (const nutrientId in notesByNutrientId) {
        const concatenatedNote = notesByNutrientId[nutrientId].join(" <br/>"); // Concatenate notes for the same nutrientId

        // Add nutrientId to the processed list
        nutrientIdsInData.push(parseInt(nutrientId));

        // Check if the comment already exists for this nutrientId in the database
        const existingComment = existingComments.find(
          (comment) => comment.Nutrient === parseInt(nutrientId)
        );

        if (existingComment) {
          // Update existing comment if found
          existingComment.Comment = concatenatedNote;
          existingComment.ModifiedOn = new Date();
          existingComment.ModifiedByID = userId;

          const updatedComment = await transactionalManager.save(
            RecommendationCommentEntity,
            existingComment
          );
          RecommendationComments.push(updatedComment);
        } else {
          // Create a new comment if not found
          const newComment = this.recommendationCommentRepository.create({
            Nutrient: parseInt(nutrientId),
            Comment: concatenatedNote,
            RecommendationID: savedCrop.ID, // Use the correct recommendation ID from the passed crop data
            CreatedOn: new Date(),
            CreatedByID: userId,
          });

          const savedComment = await transactionalManager.save(
            RecommendationCommentEntity,
            newComment
          );
          RecommendationComments.push(savedComment);
        }
      }

      // Remove comments from the database if the nutrientId is not in the new data
      const commentsToDelete = existingComments?.filter(
        (comment) => !nutrientIdsInData.includes(comment.Nutrient)
      );

      if (commentsToDelete.length > 0) {
        await transactionalManager.remove(
          RecommendationCommentEntity,
          commentsToDelete
        );
      }
      return RecommendationComments;
    };

    // Handle notes for the crop
    await saveComments(cropNotesByNutrientId, cropSaveData);

    // Push the first crop recommendation and its comments to the final result array
    Recommendations.push({
      Recommendation: cropSaveData, // First crop recommendation
      RecommendationComments,
    });

    return Recommendations;
  }

  async buildCropRecommendationDataForManure(
    cropData,
    latestSoilAnalysis,
    nutrientRecommendationsData,
    transactionalManager,
    userId,
    mannerOutputs
  ) {
    // First filter based on CropOrder from nutrientRecommendationsData
    const filteredData = await this.filterBySingleSequenceId(
      nutrientRecommendationsData,
      cropData.CropOrder
    );
    const cropID = cropData.ID;
    const results = [];

    // Get all unique defoliationIds from filtered calculations
    const defoliationIds = [
      ...new Set(filteredData?.calculations?.map((calc) => calc.defoliationId)),
    ];

    // Loop over each defoliationId
    for (const defoliationId of defoliationIds) {
      // Extract all calculations with this defoliationId
      const defoliationData = await this.extractNutrientData(
        filteredData?.calculations,
        defoliationId
      );

      let relevantMannerOutput = null,
        availableNForNextDefoliation = null,
        nextCropAvailableN = null;

      if (mannerOutputs != null) {
        relevantMannerOutput =
          mannerOutputs.find(
            (m) =>
              m.defoliationId === defoliationId && m.id === cropData.CropOrder
          ) ?? null;
      }

      if (relevantMannerOutput == null) {
        const managementPeriods = await transactionalManager.find(
          ManagementPeriodEntity,
          { where: { CropID: cropID, Defoliation: defoliationId } }
        );

        if (!managementPeriods.length) continue;

        const managementPeriod = managementPeriods[0];

        availableNForNextDefoliation =
          await this.CalculateNextDefoliationService.calculateAvailableNForNextDefoliation(
            transactionalManager,
            managementPeriod,
            cropData
          );

        if (defoliationId == 1) {
          nextCropAvailableN =
            await this.CalculateTotalAvailableNForPreviousYear.calculateAvailableNForPreviousYear(
              cropData.FieldID,
              cropData.Year,
              transactionalManager
            );
        }
      }

      // Initialize crop recommendation object for this defoliation group
      const cropRecData = {
        CropN: null,
        NBalance: null,
        CropP2O5: null,
        PBalance: null,
        CropK2O: null,
        KBalance: null,
        CropMgO: null,
        MgBalance: null,
        CropSO3: null,
        SBalance: null,
        CropNa2O: null,
        NaBalance: null,
        CropLime: null,
        LimeBalance: null,
        FertilizerN: null,
        FertilizerP2O5: null,
        FertilizerK2O: null,
        FertilizerMgO: null,
        FertilizerSO3: null,
        FertilizerNa2O: null,
        FertilizerLime: null,
        PH: latestSoilAnalysis?.PH?.toString() || null,
        SNSIndex:
          latestSoilAnalysis?.SoilNitrogenSupplyIndex?.toString() || null,
        PIndex: latestSoilAnalysis?.PhosphorusIndex?.toString() || null,
        KIndex: latestSoilAnalysis?.PotassiumIndex?.toString() || null,
        MgIndex: latestSoilAnalysis?.MagnesiumIndex?.toString() || null,
        SIndex: null,
        NIndex: null,
      };

      // Loop through each calculation inside this defoliation group.
      // Each calculation corresponds to a nutrient for this defoliation.
      for (const calc of defoliationData) {
        // Use a switch to update cropRecData based on nutrientId
        switch (calc.nutrientId) {
          case 0:
            cropRecData.CropN = calc.recommendation;
            cropRecData.FertilizerN = calc.cropNeed;
            cropRecData.ManureN = calc.manures;
            cropRecData.NBalance = calc.pkBalance;
            cropRecData.NIndex = calc.indexpH;
            break;
          case 1:
            cropRecData.CropP2O5 = calc.recommendation;
            cropRecData.ManureP2O5 = calc.manures;
            cropRecData.PBalance = calc.pkBalance;
            cropRecData.FertilizerP2O5 = calc.cropNeed;
            break;
          case 2:
            cropRecData.CropK2O = calc.recommendation;
            cropRecData.ManureK2O = calc.manures;
            cropRecData.KBalance = calc.pkBalance;
            cropRecData.FertilizerK2O = calc.cropNeed;
            break;
          case 3:
            cropRecData.CropMgO = calc.recommendation;
            cropRecData.MgBalance = calc.pkBalance;
            cropRecData.FertilizerMgO = calc.cropNeed;
            break;
          case 4:
            cropRecData.CropNa2O = calc.recommendation;
            cropRecData.NaBalance = calc.pkBalance;
            cropRecData.FertilizerNa2O = calc.cropNeed;
            break;
          case 5:
            cropRecData.CropSO3 = calc.recommendation;
            cropRecData.ManureSO3 = calc.manures;
            cropRecData.SBalance = calc.pkBalance;
            cropRecData.FertilizerSO3 = calc.cropNeed;
            break;
          case 6:
            cropRecData.CropLime = calc.recommendation;
            cropRecData.LimeBalance = calc.pkBalance;
            cropRecData.FertilizerLime = calc.cropNeed;
            break;
          default:
            console.warn(`Unhandled nutrientId: ${calc.nutrientId}`);
        }
      }

      // Retrieve the management period that matches the crop and defoliationId.
      const managementPeriods = await transactionalManager.find(
        ManagementPeriodEntity,
        { where: { CropID: cropID, Defoliation: defoliationId } }
      );

      if (!managementPeriods.length) continue;

      const managementPeriod = managementPeriods[0];

      // Check if a recommendation exists for this management period
      const existingRecommendation = await transactionalManager.findOne(
        RecommendationEntity,
        { where: { ManagementPeriodID: managementPeriod.ID } }
      );

      if (existingRecommendation) {
        // Update existing recommendation
        const updated = {
          ...existingRecommendation,
          ...cropRecData,
          ModifiedByID: userId,
          ModifiedOn: new Date(),
          Comments: `Reference Value: ${filteredData.referenceValue}\nVersion: ${filteredData.versionNumber}`,
        };
        const saved = await transactionalManager.save(
          RecommendationEntity,
          updated
        );
        results.push(saved);
      } else {
        // Create a new recommendation record
        const created = this.RecommendationRepository.create({
          ...cropRecData,
          ManagementPeriodID: managementPeriod.ID,
          Comments: `Reference Value: ${filteredData.referenceValue}\nVersion: ${filteredData.versionNumber}`,
          CreatedOn: new Date(),
          CreatedByID: userId,
        });
        const saved = await transactionalManager.save(
          RecommendationEntity,
          created
        );
        results.push(saved);
      }
    }

    return results;
  }
  async determineFieldType(crop, transactionalManager) {
    let crops;

    // Check if it's a single crop or already an array of crops
    if (Array.isArray(crop)) {
      crops = crop;
    } else {
      // Fetch all crops for the same FieldID and Year
      crops = await transactionalManager.find(CropEntity, {
        where: { FieldID: crop.FieldID, Year: crop.Year },
      });

      // If only one crop found in DB, use it
      if (crops.length === 0 && crop?.CropTypeID) {
        crops = [crop]; // fallback to single crop passed
      }
    }

    if (crops.length === 1) {
      const cropTypeID = crops[0].CropTypeID;
      if (cropTypeID === CropTypeMapper.GRASS) {
        return 2; // Grass
      } else if (
        cropTypeID !== CropTypeMapper.GRASS &&
        cropTypeID !== CropTypeMapper.OTHER
      ) {
        return 1; // Arable or Horticulture
      }
    }

    if (crops.length === 2) {
      const cropTypeIDs = crops.map((c) => c.CropTypeID);
      const isBothGrass = cropTypeIDs.every(
        (id) => id === CropTypeMapper.GRASS
      );
      const isOneGrass = cropTypeIDs.includes(CropTypeMapper.GRASS);
      const isOtherValid = cropTypeIDs.some(
        (id) => id !== CropTypeMapper.GRASS && id !== CropTypeMapper.GRASS
      );
      const isBothArable = cropTypeIDs.every(
        (id) => id !== CropTypeMapper.GRASS
      );

      if (isBothGrass) return 2; // Both crops are grass
      if (isOneGrass && isOtherValid) return 3; // Mixed
      if (isBothArable) return 1; // Both are arable/horticulture
    }

    return 1; // Default fallback
  }

  async saveRecommendationWithManure(
    organicManures,
    organicManureAllData,
    allCropData,
    allManagementPeriods,
    managementPeriods,
    request,
    fieldID,
    transactionalManager,
    userId,
    allRecommendations,
    year,
    cropTypesList
  ) {
    console.log("FUNCTION WITH MANURE STARTED");
    for (const organicManure of organicManures) {
      console.log("FUNCTION WITH MANURE STARTED INSIDE LOOP");

      const managementPeriodData = allManagementPeriods.find(
        (mp) => mp.ID === organicManure.ManagementPeriodID
      );
      const cropData = allCropData.find(
        (crop) => crop.ID === managementPeriodData.CropID
      );

      const fieldData = await transactionalManager.findOne(FieldEntity, {
        where: { ID: fieldID },
      });
      const farmData = await this.farmRespository.findOne({
        where: { ID: fieldData.FarmID },
      });
      const rb209CountryData = await transactionalManager.findOne(
        CountryEntity,
        {
          where: {
            ID: farmData.CountryID,
          },
        }
      );
      const Errors = [];
      const {
        latestSoilAnalysis,
        errors: soilAnalysisErrors,
        soilAnalysisRecords,
      } = await this.handleSoilAnalysisValidation(
        fieldData.ID,
        fieldData.Name,
        cropData?.Year,
        rb209CountryData.RB209CountryID,
        transactionalManager
      );
      Errors.push(...soilAnalysisErrors);

      if (Errors.length > 0) {
        throw new boom.HttpException(
          JSON.stringify(Errors),
          StaticStrings.HTTP_STATUS_BAD_REQUEST
        );
      }
      const pKBalanceAllData = await transactionalManager.find(
        PKBalanceEntity,
        {
          where: { FieldID: fieldID },
        }
      );

      const pkBalanceData = await this.getPKBalanceData(
        cropData?.Year - 1,
        fieldData.ID,
        pKBalanceAllData
      );
      const dataMultipleCrops = allCropData?.filter(
        (crop) =>
          crop.FieldID === fieldData.ID &&
          crop.Year === cropData.Year &&
          crop.Confirm === false
      );

      let firstCrop = null,
        mannerOutputReq = null,
        mannerOutputs = null,
        firstCropDataManureApplications = null,
        mannerOutputFirstReq = null,
        firstCropMannerOutput = null,
        secondCrop = null,
        secondCropDataManureApplications = null,
        mannerOutputSecondReq = null,
        secondCropMannerOutput = null,
        snsAnalysesData = null;
      let firstCropOrganicManure = {};
      let firstCropManagementPeriods;
      let manureApplications;
      let newOrganicManure = null;
      mannerOutputs =
        await this.CalculateMannerOutput.calculateMannerOutputForOrganicManure(
          cropData,
          newOrganicManure,
          farmData,
          fieldData,
          transactionalManager,
          request
        );
      if (dataMultipleCrops.length > 1) {
        snsAnalysesData = [];
        firstCrop = await this.getFirstCropData(
          transactionalManager,
          fieldData.ID,
          cropData.Year
        );
        const firstCropSnsAnalysis = await this.getSnsAnalysesData(
          transactionalManager,
          firstCrop
        );
        if (firstCropSnsAnalysis) {
          snsAnalysesData.push(firstCropSnsAnalysis);
        }

        firstCropManagementPeriods = managementPeriods.find(
          (mp) => mp.CropID == firstCrop.ID
        );

        // Find the crop where CropOrder == 2
        const secondCrop = dataMultipleCrops.find(
          (crop) => crop.CropOrder === CropOrderMapper.SECONDCROP
        );
        const secondCropSnsAnalysis = await this.getSnsAnalysesData(
          transactionalManager,
          secondCrop
        );
        if (secondCropSnsAnalysis) {
          snsAnalysesData.push(secondCropSnsAnalysis);
        }
        const secondCropManagementPeriods = managementPeriods.find(
          (mp) => mp.CropID == secondCrop.ID
        );
      } else {
        snsAnalysesData = await this.getSnsAnalysesData(
          transactionalManager,
          cropData
        );
      }

      let nutrientRecommendationsData;
      const secondCropManagementData = await this.getManagementPeriod(
        transactionalManager,
        cropData.ID
      );
      let fertiliserData;
      if (organicManure.ManagementPeriodID) {
        fertiliserData = await this.getP205AndK20fromfertiliser(
          transactionalManager,
          organicManure.ManagementPeriodID
        );
      }

      let pkBalance = await this.getPKBalanceData(
        cropData?.Year,
        fieldData.ID,
        pKBalanceAllData
      );
      let cropPOfftake = 0;
      if (latestSoilAnalysis.PhosphorusIndex) {
        if (
          latestSoilAnalysis.PhosphorusIndex < 4 &&
          (cropData.CropTypeID == CropTypeMapper.POTATOVARIETYGROUP1 ||
            cropData.CropTypeID == CropTypeMapper.POTATOVARIETYGROUP2 ||
            cropData.CropTypeID == CropTypeMapper.POTATOVARIETYGROUP3 ||
            cropData.CropTypeID == CropTypeMapper.POTATOVARIETYGROUP4)
        ) {
          cropPOfftake = cropData.Yield ? cropData.Yield : 50;
        }
      }

      const previousCrop =
        await this.CalculatePreviousCropService.findPreviousCrop(
          fieldData.ID,
          cropData.Year,
          transactionalManager
        );

      if (
        cropData.CropTypeID === CropTypeMapper.OTHER ||
        cropData.IsBasePlan ||
        !previousCrop
      ) {
        const otherRecommendations = await this.saveRecommendationForOtherCrops(
          transactionalManager,
          organicManure,
          cropData,
          mannerOutputs,
          userId,
          latestSoilAnalysis,
          snsAnalysesData,
          allRecommendations
        );

        const saveAndUpdatePKBalance = await this.UpdatePKBalance(
          fieldData.ID,
          cropData,
          nutrientRecommendationsData,
          pkBalanceData,
          pKBalanceAllData,
          userId,
          secondCropManagementData,
          fertiliserData,
          year,
          transactionalManager,
          cropPOfftake,
          latestSoilAnalysis,
          previousCrop
        );

        if (saveAndUpdatePKBalance) {
          await transactionalManager.save(
            PKBalanceEntity,
            saveAndUpdatePKBalance.saveAndUpdatePKBalance
          );
        }

        return {
          otherOrganicManures: organicManures,
          otherUpdatedPKBalance: saveAndUpdatePKBalance,
        };
      }

      const nutrientRecommendationnReqBody =
        await this.buildNutrientRecommendationReqBody(
          fieldData,
          farmData,
          soilAnalysisRecords,
          snsAnalysesData,
          dataMultipleCrops,
          cropData,
          mannerOutputs,
          firstCrop,
          organicManure,
          pkBalanceData,
          rb209CountryData.RB209CountryID,
          transactionalManager,
          request,
          cropTypesList
        );

      nutrientRecommendationsData = await this.getNutrientRecommendationsData(
        nutrientRecommendationnReqBody
      );
      console.log("nutrientRecommendationsData", nutrientRecommendationsData);

      let arableNotes = nutrientRecommendationsData.adviceNotes;
      let savedRecommendation,
        savedRecommendationComment = [],
        Recommendations = [];
      for (const cropData of dataMultipleCrops) {
        savedRecommendation = await this.buildCropRecommendationDataForManure(
          cropData,
          latestSoilAnalysis,
          nutrientRecommendationsData,
          transactionalManager,
          userId,
          mannerOutputs
        );

        const isGrass = cropData.CropTypeID === CropTypeMapper.GRASS;

        const hasDefoliationIdInAdviceNotes =
          nutrientRecommendationsData.adviceNotes?.some((note) =>
            Object.prototype.hasOwnProperty.call(note, "defoliationId")
          );

        if (isGrass) {
          if (hasDefoliationIdInAdviceNotes) {
            for (const singleRecommendation of savedRecommendation) {
              await this.saveMultipleRecommendation(
                Recommendations,
                cropData,
                singleRecommendation,
                transactionalManager,
                nutrientRecommendationsData,
                userId
              );
            }
          } else {
            await this.saveMultipleRecommendation(
              Recommendations,
              cropData,
              savedRecommendation[0],
              transactionalManager,
              nutrientRecommendationsData,
              userId
            );
          }
        } else {
          await this.saveMultipleRecommendation(
            Recommendations,
            cropData,
            savedRecommendation[0],
            transactionalManager,
            nutrientRecommendationsData,
            userId
          );
        }
      }
      const saveAndUpdatePKBalanceArableOrGrass = await this.UpdatePKBalance(
        fieldData.ID,
        cropData,
        nutrientRecommendationsData,
        pkBalanceData,
        pKBalanceAllData,
        userId,
        secondCropManagementData,
        fertiliserData,
        year,
        transactionalManager,
        cropPOfftake,
        latestSoilAnalysis,
        previousCrop
      );

      if (saveAndUpdatePKBalanceArableOrGrass) {
        await transactionalManager.save(
          PKBalanceEntity,
          saveAndUpdatePKBalanceArableOrGrass.saveAndUpdatePKBalance
        );
      }

      return {
        savedRecommendationsData: Recommendations,
        saveAndUpdatePKBalance: saveAndUpdatePKBalanceArableOrGrass,
      };
    }
  }

  async saveRecommendationWithoutManure(
    crops,
    organicManures,
    organicManureAllData,
    allManagementPeriods,
    request,
    fieldID,
    transactionalManager,
    userId,
    allRecommendations,
    year,
    cropTypesList
  ) {
    console.log("WITHOUT MANURE STARTED");
    const Recommendations = [];
    const Errors = [];

    for (const crop of crops) {
      console.log("WITHOUT MANURE STARTED INSIDE LOOP");

      const errors = await this.handleCropValidation(crop);

      const fieldId = crop.FieldID;

      const pKBalanceAllData = await transactionalManager.find(
        PKBalanceEntity,
        {
          where: { FieldID: fieldID },
        }
      );

      const pkBalanceData = await this.getPKBalanceData(
        crop?.Year - 1,
        fieldId,
        pKBalanceAllData
      );

      const cropPlanOfNextYear = await this.getCropPlanOfNextYear(
        transactionalManager,
        crop?.Year,
        fieldId
      );
      const { field, errors: fieldErrors } = await this.handleFieldValidation(
        fieldId
      );
      const { farm, errors: farmErrors } = await this.handleFarmValidation(
        field.FarmID
      );
      const rb209CountryData = await transactionalManager.findOne(
        CountryEntity,
        {
          where: {
            ID: farm.CountryID,
          },
        }
      );

      const dataMultipleCrops = await transactionalManager.find(CropEntity, {
        where: {
          FieldID: fieldId,
          Year: crop.Year,
          Confirm: false,
        },
      });

      const {
        latestSoilAnalysis,
        errors: soilAnalysisErrors,
        soilAnalysisRecords,
      } = await this.handleSoilAnalysisValidation(
        fieldId,
        field.Name,
        crop?.Year,
        rb209CountryData.RB209CountryID,
        transactionalManager
      );
      Errors.push(...soilAnalysisErrors);
      if (Errors.length > 0) {
        throw new Error(JSON.stringify(Errors));
      }

      Errors.push(...soilAnalysisErrors);
      if (Errors.length > 0) {
        throw new Error(JSON.stringify(Errors));
      }

      const secondCropManagementData = await this.getManagementPeriod(
        transactionalManager,
        crop.ID
      );
      let fertiliserData;
      if (secondCropManagementData.ID) {
        fertiliserData = await this.getP205AndK20fromfertiliser(
          transactionalManager,
          secondCropManagementData.ID
        );
      }

      let snsAnalysesData = null;

      // Check if more than one crop exists in dataMultipleCrops
      if (dataMultipleCrops.length > 1) {
        // Initialize snsAnalysesData as an array if multiple crops are found
        snsAnalysesData = [];

        // Loop through each crop in dataMultipleCrops
        for (const singleCrop of dataMultipleCrops) {
          // Retrieve snsAnalysesData for each crop by crop.ID
          const analysisData = await this.getSnsAnalysesData(
            transactionalManager,
            singleCrop
          );

          // Check if snsAnalysesData exists (not null or empty)
          if (analysisData) {
            // Push to snsAnalysesData array if snsAnalysesData is found
            snsAnalysesData.push(analysisData);
          }
        }
      } else if (dataMultipleCrops.length === 1) {
        // If there is only one crop, get snsAnalysesData for that crop
        const analysisData = await this.getSnsAnalysesData(
          transactionalManager,
          crop
        );

        // Check if snsAnalysesData exists and assign directly as an object
        if (analysisData) {
          snsAnalysesData = analysisData; // Assign snsAnalysesData directly as an object
        }
      }
      let nutrientRecommendationsData;
      //get PKBalance data
      let pkBalance = await this.getPKBalanceData(
        crop?.Year,
        fieldId,
        pKBalanceAllData
      );
      let newOrganicManure = null,
        mannerOutputs = null;
      mannerOutputs =
        await this.CalculateMannerOutput.calculateMannerOutputForOrganicManure(
          crop,
          newOrganicManure,
          farm,
          field,
          transactionalManager,
          request
        );

      let cropPOfftake = 0;
      if (latestSoilAnalysis.PhosphorusIndex) {
        if (
          latestSoilAnalysis.PhosphorusIndex < 4 &&
          (crop.CropTypeID == CropTypeMapper.POTATOVARIETYGROUP1 ||
            crop.CropTypeID == CropTypeMapper.POTATOVARIETYGROUP2 ||
            crop.CropTypeID == CropTypeMapper.POTATOVARIETYGROUP3 ||
            crop.CropTypeID == CropTypeMapper.POTATOVARIETYGROUP4)
        ) {
          cropPOfftake = crop.Yield ? crop.Yield : 50;
        }
      }

      const previousCrop =
        await this.CalculatePreviousCropService.findPreviousCrop(
          field.ID,
          crop.Year,
          transactionalManager
        );

      if (
        crop.CropTypeID === CropTypeMapper.OTHER ||
        crop?.IsBasePlan ||
        !previousCrop
      ) {
        let organicManure = null;

        try {
          const otherRecommendations =
            await this.saveRecommendationForOtherCrops(
              transactionalManager,
              organicManure,
              crop,
              mannerOutputs,
              userId,
              latestSoilAnalysis,
              snsAnalysesData,
              allRecommendations
            );
          const saveAndUpdatePKBalance = await this.UpdatePKBalance(
            fieldId,
            crop,
            nutrientRecommendationsData,
            pkBalanceData,
            pKBalanceAllData,
            userId,
            secondCropManagementData,
            fertiliserData,
            year,
            transactionalManager,
            cropPOfftake,
            latestSoilAnalysis,
            previousCrop
          );

          if (saveAndUpdatePKBalance) {
            await transactionalManager.save(
              PKBalanceEntity,
              saveAndUpdatePKBalance.saveAndUpdatePKBalance
            );
          }
        } catch (error) {
          console.error(
            `Error while saving PKBalance Data FieldId: ${fieldId} And Year:${crop?.Year}:`,
            error
          );
        }

        return {
          message: "Default crop saved and exiting early",
          Recommendations,
        };
      } else {
        const nutrientRecommendationnReqBody =
          await this.buildNutrientWithoutMannerRecommendationReqBody(
            field,
            farm,
            soilAnalysisRecords,
            snsAnalysesData,
            dataMultipleCrops,
            crop,
            pkBalanceData,
            transactionalManager,
            rb209CountryData.RB209CountryID,
            request,
            cropTypesList
          );
        console.log(
          "nutrientRecommendationnReqBodysns",
          nutrientRecommendationnReqBody.field.soil.soilAnalyses
        );

        nutrientRecommendationsData = await this.getNutrientRecommendationsData(
          nutrientRecommendationnReqBody
        );
        if (
          !nutrientRecommendationsData ||
          nutrientRecommendationsData?.calculations == null ||
          nutrientRecommendationsData?.adviceNotes == null
        ) {
          throw boom.badData(`${nutrientRecommendationsData.data.error}`);
        } else if (nutrientRecommendationsData.data?.Invalid) {
          throw boom.badRequest(
            `${nutrientRecommendationsData.data?.Invalid[0]}`
          );
        } else if (nutrientRecommendationsData.data?.missing) {
          throw boom.badRequest(
            `${nutrientRecommendationsData.data?.missing[0]}`
          );
        }

        try {
          const saveAndUpdatePKBalance = await this.UpdatePKBalance(
            fieldId,
            crop,
            nutrientRecommendationsData,
            pkBalanceData,
            pKBalanceAllData,
            userId,
            secondCropManagementData,
            fertiliserData,
            year,
            transactionalManager,
            cropPOfftake,
            latestSoilAnalysis,
            previousCrop
          );

          if (saveAndUpdatePKBalance) {
            await transactionalManager.save(
              PKBalanceEntity,
              saveAndUpdatePKBalance.saveAndUpdatePKBalance
            );
          }
        } catch (error) {
          console.error(
            `Error while saving PKBalance Data FieldId: ${fieldId} And Year:${crop?.Year}:`,
            error
          );
        }
      }
      let savedRecommendation;

      for (const cropData of dataMultipleCrops) {
        savedRecommendation = await this.buildCropRecommendationData(
          cropData,
          latestSoilAnalysis,
          nutrientRecommendationsData,
          transactionalManager,
          userId
        );

        const isGrass = cropData.CropTypeID === CropTypeMapper.GRASS;

        const hasDefoliationIdInAdviceNotes =
          nutrientRecommendationsData.adviceNotes?.some((note) =>
            Object.prototype.hasOwnProperty.call(note, "defoliationId")
          );

        if (isGrass) {
          if (hasDefoliationIdInAdviceNotes) {
            for (const singleRecommendation of savedRecommendation) {
              savedRecommendation = await this.saveMultipleRecommendation(
                Recommendations,
                cropData,
                singleRecommendation,
                transactionalManager,
                nutrientRecommendationsData,
                userId
              );
            }
          } else {
            savedRecommendation = await this.saveMultipleRecommendation(
              Recommendations,
              cropData,
              savedRecommendation[0],
              transactionalManager,
              nutrientRecommendationsData,
              userId
            );
          }
        } else {
          savedRecommendation = await this.saveMultipleRecommendation(
            Recommendations,
            cropData,
            savedRecommendation[0],
            transactionalManager,
            nutrientRecommendationsData,
            userId
          );
        }
      }
    }
  }

  async filterBySingleSequenceId(data, sequenceId) {
    const filteredCalculations = data?.calculations?.filter(
      (item) => item.sequenceId === sequenceId
    );

    const filteredAdviceNotes = data?.adviceNotes?.filter(
      (item) => item.sequenceId === sequenceId
    );

    return {
      ...data,
      calculations: filteredCalculations,
      adviceNotes: filteredAdviceNotes,
    };
  }
  async extractNutrientData(calculations, defoliationId) {
    return calculations?.filter((c) => c.defoliationId === defoliationId);
  }
  async buildCropRecommendationData(
    cropData,
    latestSoilAnalysis,
    nutrientRecommendationsData,
    transactionalManager,
    userId
  ) {
    // First filter based on CropOrder from nutrientRecommendationsData
    const filteredData = await this.filterBySingleSequenceId(
      nutrientRecommendationsData,
      cropData.CropOrder
    );
    const cropID = cropData.ID;
    const results = [];

    // Get all unique defoliationIds from filtered calculations
    const defoliationIds = [
      ...new Set(filteredData?.calculations?.map((calc) => calc.defoliationId)),
    ];

    // Loop over each defoliationId
    for (const defoliationId of defoliationIds) {
      // Extract all calculations with this defoliationId
      const defoliationData = await this.extractNutrientData(
        filteredData.calculations,
        defoliationId
      );

      const managementPeriods = await transactionalManager.find(
        ManagementPeriodEntity,
        { where: { CropID: cropID, Defoliation: defoliationId } }
      );

      if (!managementPeriods.length) continue;

      const managementPeriod = managementPeriods[0];
      let availableNForNextDefoliation = null,
        nextCropAvailableN = null;

      availableNForNextDefoliation =
        await this.CalculateNextDefoliationService.calculateAvailableNForNextDefoliation(
          transactionalManager,
          managementPeriod,
          cropData
        );

      if (defoliationId == 1) {
        nextCropAvailableN =
          await this.CalculateTotalAvailableNForPreviousYear.calculateAvailableNForPreviousYear(
            cropData.FieldID,
            cropData.Year,
            transactionalManager
          );
      }

      // Initialize crop recommendation object for this defoliation group
      const cropRecData = {
        CropN: null,
        NBalance: null,
        ManureN: null,
        CropP2O5: null,
        PBalance: null,
        ManureP2O5: null,
        CropK2O: null,
        KBalance: null,
        ManureK2O: null,
        CropMgO: null,
        MgBalance: null,
        ManureMgO: null,
        CropSO3: null,
        SBalance: null,
        ManureSO3: null,
        CropNa2O: null,
        NaBalance: null,
        ManureNa2O: null,
        CropLime: null,
        LimeBalance: null,
        FertilizerN: null,
        FertilizerP2O5: null,
        FertilizerK2O: null,
        FertilizerMgO: null,
        FertilizerSO3: null,
        FertilizerNa2O: null,
        FertilizerLime: null,
        PH: latestSoilAnalysis?.PH?.toString() || null,
        SNSIndex:
          latestSoilAnalysis?.SoilNitrogenSupplyIndex?.toString() || null,
        PIndex: latestSoilAnalysis?.PhosphorusIndex?.toString() || null,
        KIndex: latestSoilAnalysis?.PotassiumIndex?.toString() || null,
        MgIndex: latestSoilAnalysis?.MagnesiumIndex?.toString() || null,
        SIndex: null,
        NIndex: null,
      };

      // Loop through each calculation inside this defoliation group.
      // Each calculation corresponds to a nutrient for this defoliation.
      for (const calc of defoliationData) {
        // Use a switch to update cropRecData based on nutrientId
        switch (calc.nutrientId) {
          case 0:
            cropRecData.CropN = calc.recommendation;
            cropRecData.FertilizerN = calc.cropNeed;
            cropRecData.ManureN =
              availableNForNextDefoliation + nextCropAvailableN == 0
                ? null
                : availableNForNextDefoliation + nextCropAvailableN;
            cropRecData.NBalance = calc.pkBalance;
            cropRecData.NIndex = calc.indexpH;
            break;
          case 1:
            cropRecData.CropP2O5 = calc.recommendation;
            cropRecData.PBalance = calc.pkBalance;
            cropRecData.FertilizerP2O5 = calc.cropNeed;
            break;
          case 2:
            cropRecData.CropK2O = calc.recommendation;
            cropRecData.KBalance = calc.pkBalance;
            cropRecData.FertilizerK2O = calc.cropNeed;
            break;
          case 3:
            cropRecData.CropMgO = calc.recommendation;
            cropRecData.MgBalance = calc.pkBalance;
            cropRecData.FertilizerMgO = calc.cropNeed;
            break;
          case 4:
            cropRecData.CropNa2O = calc.recommendation;
            cropRecData.NaBalance = calc.pkBalance;
            cropRecData.FertilizerNa2O = calc.cropNeed;
            break;
          case 5:
            cropRecData.CropSO3 = calc.recommendation;
            cropRecData.SBalance = calc.pkBalance;
            cropRecData.FertilizerSO3 = calc.cropNeed;
            break;
          case 6:
            cropRecData.CropLime = calc.recommendation;
            cropRecData.LimeBalance = calc.pkBalance;
            cropRecData.FertilizerLime = calc.cropNeed;
            break;
          default:
            console.warn(`Unhandled nutrientId: ${calc.nutrientId}`);
        }
      }

      // Check if a recommendation exists for this management period
      const existingRecommendation = await transactionalManager.findOne(
        RecommendationEntity,
        { where: { ManagementPeriodID: managementPeriod.ID } }
      );

      if (existingRecommendation) {
        // Update existing recommendation
        const updated = {
          ...existingRecommendation,
          ...cropRecData,
          ModifiedByID: userId,
          ModifiedOn: new Date(),
          Comments: `Reference Value: ${filteredData.referenceValue}\nVersion: ${filteredData.versionNumber}`,
        };
        const saved = await transactionalManager.save(
          RecommendationEntity,
          updated
        );
        results.push(saved);
      } else {
        // Create a new recommendation record
        const created = this.RecommendationRepository.create({
          ...cropRecData,
          ManagementPeriodID: managementPeriod.ID,
          Comments: `Reference Value: ${filteredData.referenceValue}\nVersion: ${filteredData.versionNumber}`,
          CreatedOn: new Date(),
          CreatedByID: userId,
        });
        const saved = await transactionalManager.save(
          RecommendationEntity,
          created
        );
        results.push(saved);
      }
    }

    return results;
  }
  async getFirstCropData(transactionalManager, FieldID, Year) {
    const data = await transactionalManager.findOne(CropEntity, {
      where: {
        FieldID: FieldID,
        Year: Year,
        Confirm: false, // Or 0 if using numeric
        CropOrder: 1,
      },
    });
    return data;
  }

  async getRecommendationByManagementPeriodID(
    managementPeriodID,
    allRecommendations
  ) {
    // Fallback to finding the recommendation from allRecommendationData
    return allRecommendations.find(
      (data) => data.ManagementPeriodID === managementPeriodID
    );
  }

  async getFertiliserData(ID) {
    return await this.fertiliserRepository.findOne({
      where: { ManagementPeriodID: ID },
    });
  }
  async getP205AndK20fromfertiliser(transactionalManager, managementPeriodId) {
    let sumOfP205 = 0;
    let sumOfK20 = 0;

    const fertiliserData = await transactionalManager.find(
      FertiliserManuresEntity,
      {
        where: {
          ManagementPeriodID: managementPeriodId,
        },
        select: {
          P2O5: true,
          K2O: true,
        },
      }
    );

    if (fertiliserData && fertiliserData.length > 0) {
      for (const fertiliser of fertiliserData) {
        sumOfP205 += fertiliser.P2O5 || 0;
        sumOfK20 += fertiliser.K2O || 0;
      }
    }
    return { p205: sumOfP205, k20: sumOfK20 };
  }
  async UpdatePKBalance(
    fieldId,
    crop,
    nutrientRecommendationsData,
    pkBalanceData,
    pKBalanceAllData,
    userId,
    secondCropManagementData,
    fertiliserData,
    year,
    transactionalManager,
    cropPOfftake,
    latestSoilAnalysis,
    previousCrop
  ) {
    try {
      let pBalance = 0;
      let kBalance = 0;
      let saveAndUpdatePKBalance;

      if (crop.CropTypeID == CropTypeMapper.OTHER) {
        const otherPKBalance =
          await this.CalculatePKBalanceOther.calculatePKBalanceOther(
            crop,
            latestSoilAnalysis,
            transactionalManager
          );

        pBalance = otherPKBalance.pBalance;
        kBalance = otherPKBalance.kBalance;
      } else if (crop.IsBasePlan || !previousCrop) {
        if (pkBalanceData) {
          pBalance =
            (fertiliserData == null ? 0 : fertiliserData.p205) -
            (0 - pkBalanceData == null ? 0 : pkBalanceData.PBalance);
          kBalance =
            (fertiliserData == null ? 0 : fertiliserData.k20) -
            (0 - pkBalanceData == null ? 0 : pkBalanceData.KBalance);
        } else {
          pBalance = fertiliserData == null ? 0 : fertiliserData.p205;
          kBalance = fertiliserData == null ? 0 : fertiliserData.k20;
        }
      } else {
        for (const recommendation of nutrientRecommendationsData.calculations) {
          switch (recommendation.nutrientId) {
            case 1:
              pBalance =
                (fertiliserData == null ? 0 : fertiliserData.p205) -
                recommendation.recommendation -
                cropPOfftake +
                recommendation.manures +
                recommendation.pkBalance;
              break;
            case 2:
              kBalance =
                (fertiliserData == null ? 0 : fertiliserData.k20) -
                recommendation.recommendation +
                recommendation.manures +
                recommendation.pkBalance;
              break;
          }
        }
      }
      //geting current pKBalance
      const pkBalance = await transactionalManager.findOne(PKBalanceEntity, {
        where: {
          FieldID: fieldId,
          Year: crop.Year,
        },
      });

      if (Object.keys(latestSoilAnalysis).length > 0) {
        if (latestSoilAnalysis.PotassiumIndex == null) {
          kBalance = 0;
        }

        if (latestSoilAnalysis.PhosphorusIndex == null) {
          pBalance = 0;
        }
      } else {
        pBalance = 0;
        kBalance = 0;
      }
      if (pkBalance) {
        const updateData = {
          Year: year,
          FieldID: fieldId,
          PBalance: pBalance,
          KBalance: kBalance,
        };
        saveAndUpdatePKBalance = {
          ...pkBalance,
          ...updateData,
          ModifiedOn: new Date(),
          ModifiedByID: userId,
        };
      } else {
        saveAndUpdatePKBalance = {
          Year: year,
          FieldID: fieldId,
          PBalance: pBalance,
          KBalance: kBalance,
          CreatedOn: new Date(),
          CreatedByID: userId,
        };
      }

      return { saveAndUpdatePKBalance };
    } catch (error) {
      console.error("Error while saving pkBalance data", error);
      throw error;
    }
  }

  async saveMultipleRecommendation(
    Recommendations,
    savedCrop,
    cropSaveData,
    transactionalManager,
    nutrientRecommendationsData,
    userId
  ) {
    const RecommendationComments = [];
    let cropNotes = [];

    const hasDefoliationIdInNotes =
      nutrientRecommendationsData.adviceNotes?.some((note) =>
        Object.prototype.hasOwnProperty.call(note, "defoliationId")
      );

    if (hasDefoliationIdInNotes) {
      const managementPeriod = await transactionalManager.find(
        ManagementPeriodEntity,
        {
          where: { ID: savedCrop.ManagementPeriodID },
        }
      );

      const defoliationValue = managementPeriod?.[0]?.Defoliation;

      cropNotes = nutrientRecommendationsData.adviceNotes.filter(
        (note) =>
          note.defoliationId === defoliationValue &&
          note.sequenceId === savedCrop.CropOrder
      );
    } else {
      cropNotes = nutrientRecommendationsData.adviceNotes?.filter(
        (note) => note.sequenceId === savedCrop.CropOrder
      );
    }

    // Helper function to group notes by nutrientId and concatenate them
    const groupNotesByNutrientId = (notes) => {
      return notes.reduce((acc, adviceNote) => {
        const nutrientId = adviceNote.nutrientId;
        if (!acc[nutrientId]) {
          acc[nutrientId] = [];
        }
        acc[nutrientId].push(adviceNote.note); // Group notes by nutrientId
        return acc;
      }, {});
    };

    const cropNotesByNutrientId = groupNotesByNutrientId(cropNotes);
    //const secondCropNotesByNutrientId = groupNotesByNutrientId(secondCropNotes);

    // Track nutrient IDs that are being processed
    const nutrientIdsInData = [];

    // Function to handle saving comments (with updates or creations)
    const saveComments = async (notesByNutrientId, savedCrop) => {
      const existingComments = await transactionalManager.find(
        RecommendationCommentEntity,
        { where: { RecommendationID: savedCrop.ID } }
      );

      for (const nutrientId in notesByNutrientId) {
        const concatenatedNote = notesByNutrientId[nutrientId].join(" <br/>"); // Concatenate notes for the same nutrientId

        // Add nutrientId to the processed list
        nutrientIdsInData.push(parseInt(nutrientId));

        // Check if the comment already exists for this nutrientId in the database
        const existingComment = existingComments.find(
          (comment) => comment.Nutrient === parseInt(nutrientId)
        );

        if (existingComment) {
          // Update existing comment if found
          existingComment.Comment = concatenatedNote;
          existingComment.ModifiedOn = new Date();
          existingComment.ModifiedByID = userId;

          const updatedComment = await transactionalManager.save(
            RecommendationCommentEntity,
            existingComment
          );
          RecommendationComments.push(updatedComment);
        } else {
          // Create a new comment if not found
          const newComment = this.recommendationCommentRepository.create({
            Nutrient: parseInt(nutrientId),
            Comment: concatenatedNote,
            RecommendationID: savedCrop.ID, // Use the correct recommendation ID from the passed crop data
            CreatedOn: new Date(),
            CreatedByID: userId,
          });

          const savedComment = await transactionalManager.save(
            RecommendationCommentEntity,
            newComment
          );
          RecommendationComments.push(savedComment);
        }
      }

      // Remove comments from the database if the nutrientId is not in the new data
      const commentsToDelete = existingComments.filter(
        (comment) => !nutrientIdsInData.includes(comment.Nutrient)
      );

      if (commentsToDelete.length > 0) {
        await transactionalManager.remove(
          RecommendationCommentEntity,
          commentsToDelete
        );
      }
      return RecommendationComments;
    };

    // Handle notes for the crop
    await saveComments(cropNotesByNutrientId, cropSaveData);

    // Push the first crop recommendation and its comments to the final result array
    Recommendations.push({
      Recommendation: cropSaveData, // First crop recommendation
      RecommendationComments,
    });

    return Recommendations;
  }
  async savedDefault(cropData, userId, transactionalManager) {
    const ManagementPeriods = [];

    // Save the Crop first (assumed as savedCrop)
    const savedCrop = await transactionalManager.save(
      CropEntity,
      this.cropRepository.create({
        ...cropData,
        FieldID: cropData.FieldID, // assuming cropData contains Crop object
        CreatedByID: userId,
      })
    );

    // Iterate over the cropData ManagementPeriods and save them using the transactionalManager
    for (const managementPeriod of cropData.ManagementPeriods) {
      const savedManagementPeriod = await transactionalManager.save(
        ManagementPeriodEntity,
        this.managementPeriodRepository.create({
          ...managementPeriod,
          CropID: savedCrop.ID, // Link saved crop with ManagementPeriods
          CreatedByID: userId,
        })
      );
      ManagementPeriods.push(savedManagementPeriod);

      //Call saveRecommendationCrops immediately after saving each ManagementPeriod
      await this.savedefaultRecommendationCrops(
        transactionalManager,
        savedManagementPeriod.ID, // Pass the saved management period's ID
        userId
      );
    }

    // Return the transaction result with the saved crop and management periods
    return {
      Crop: savedCrop,
      ManagementPeriods,
    };
  }
  async handleFarmValidation(farmId) {
    const errors = [];

    const farm = await this.farmRespository.findOneBy({
      ID: farmId,
    });

    if (!farm) {
      errors.push(`Please add farm data data for farmId ${farmId}`);
    }

    const farmRequiredKeys = [
      "TotalFarmArea",
      "Postcode",
      "Rainfall",
      "EnglishRules",
    ];
    farmRequiredKeys.forEach((key) => {
      if (farm[key] === null) {
        errors.push(`${key} is required in farm ${farm.Name}`);
      }
    });
    return { farm, errors };
  }
  async handleFieldValidation(fieldId) {
    const errors = [];

    const field = await this.fieldRespository.findOneBy({
      ID: fieldId,
    });

    if (!field) {
      errors.push(`Please add field data for fieldId ${fieldId}`);
    }

    if (field.SoilTypeID === null) {
      errors.push(`SoilTypeID is required in field ${field.Name}`);
    }
    return { field, errors };
  }

  async getCropPlanOfNextYear(transactionalManager, cropYear, fieldId) {
    return await transactionalManager.find(CropEntity, {
      where: {
        FieldID: fieldId,
        Year: MoreThan(cropYear),
      },
      select: { ID: true },
    });
  }

  async getPKBalanceData(cropYear, fieldId, pKBalanceAllData) {
    // Fallback to finding data from pKBalanceAllData
    return pKBalanceAllData.find(
      (data) => data.Year === cropYear && data.FieldID === fieldId
    );
  }

  async handleCropValidation(crop) {
    const errors = [];

    if (!crop) {
      errors.push("Crop is required");
    }

    if (crop.Year === null) {
      errors.push("Year is required in crop");
    }
    if (crop.CropTypeID === null) {
      errors.push("CropTypeId is required in crop");
    }

    if (crop.FieldID === null) {
      errors.push("FieldID is required in crop");
    }

    return errors;
  }

  async saveOrganicManureForOtherCropType(
    organicManureData,
    mannerOutputs,
    transactionalManager,
    userId,
    organicManures
  ) {
    const savedOrganicManure = await transactionalManager.save(
      OrganicManureEntity,
      this.repository.create({
        ...organicManureData.OrganicManure,
        AvailableN: mannerOutputs.data.currentCropAvailableN,
        CreatedByID: userId,
        ...(organicManureData.OrganicManure.ID == 0 ? { ID: null } : {}),
      })
    );
    organicManures.push(savedOrganicManure);
  }
  async saveRecommendationForOtherCrops(
    transactionalManager,
    organicManure,
    crop,
    mannerOutputs,
    userId,
    latestSoilAnalysis,
    snsAnalysesData,
    allRecommendations
  ) {
    if (mannerOutputs.length == 0) {
      mannerOutputs = null;
    }
    //console.log("mannerOutputs[0]?.availableS", mannerOutputs[0]?.availableS);
    let cropOrderData = {
      CropN: null,
      ManureN: mannerOutputs != null ? mannerOutputs[0]?.availableN : null,
      NBalance: null,
      FertilizerN: null,
      CropP2O5: null,
      ManureP2O5: mannerOutputs != null ? mannerOutputs[0]?.availableP : null,
      PBalance: null,
      FertilizerP2O5: null,
      CropK2O: null,
      ManureK2O: mannerOutputs != null ? mannerOutputs[0]?.availableK : null,
      KBalance: null,
      FertilizerK2O: null,
      CropMgO: null,
      ManureMgO: null,
      MgBalance: null,
      FertilizerMgO: null,
      CropSO3: null,
      ManureSO3: mannerOutputs != null ? mannerOutputs[0]?.availableS : null,
      SBalance: null,
      FertilizerSO3: null,
      CropNa2O: null,
      ManureNa2O: null,
      NaBalance: null,
      FertilizerNa2O: null,
      CropLime: null,
      ManureLime: null,
      LimeBalance: null,
      FertilizerLime: null,
      PH: latestSoilAnalysis?.PH?.toString() || null,
      SNSIndex: latestSoilAnalysis?.SoilNitrogenSupplyIndex?.toString() || null,
      PIndex: latestSoilAnalysis?.PhosphorusIndex?.toString() || null,
      KIndex: latestSoilAnalysis?.PotassiumIndex?.toString() || null,
      MgIndex: latestSoilAnalysis?.MagnesiumIndex?.toString() || null,
      SIndex: null,
    };

    let recommendation;
    if (organicManure) {
      recommendation = allRecommendations.find(
        (rec) => rec.ManagementPeriodID === organicManure.ManagementPeriodID
      );
    } else {
      const managementPeriod = await transactionalManager.findOne(
        ManagementPeriodEntity,
        { where: { CropID: crop.ID } }
      );

      recommendation = allRecommendations.find(
        (rec) => rec.ManagementPeriodID === managementPeriod.ID
      );
    }

    if (recommendation) {
      // If a recommendation exists, update it
      recommendation = {
        ...recommendation,
        ...cropOrderData,
        ModifiedOn: new Date(),
        ModifiedByID: userId,
      };
      await transactionalManager.save(RecommendationEntity, recommendation);
    }
    return recommendation;
  }

  async saveOrUpdateArableNotes(
    arableNotes,
    savedData,
    transactionalManager,
    userId
  ) {
    const recommendationComments = [];

    // Separate notes by crop sequence
    const firstCropNotes = arableNotes?.filter((note) => note.sequenceId === 1);
    const secondCropNotes = arableNotes?.filter(
      (note) => note.sequenceId === 2
    );

    // Group notes by nutrientId and concatenate
    const groupNotesByNutrientId = (notes) => {
      return notes.reduce((acc, note) => {
        if (!acc[note.nutrientId]) acc[note.nutrientId] = [];
        acc[note.nutrientId].push(note.note);
        return acc;
      }, {});
    };

    const firstCropNotesByNutrientId = groupNotesByNutrientId(firstCropNotes);
    const secondCropNotesByNutrientId = groupNotesByNutrientId(secondCropNotes);

    // Helper to handle comment updates and deletions for each crop's notes
    const saveComments = async (notesByNutrientId, recommendationId) => {
      const nutrientIdsInNotes = Object.keys(notesByNutrientId).map(Number);
      const existingComments = await transactionalManager.find(
        RecommendationCommentEntity,
        { where: { RecommendationID: recommendationId } }
      );

      for (const nutrientId in notesByNutrientId) {
        const concatenatedNote = notesByNutrientId[nutrientId].join(" <br/>");

        const existingComment = existingComments.find(
          (comment) => comment.Nutrient === Number(nutrientId)
        );

        if (existingComment) {
          // Update existing comment
          existingComment.Comment = concatenatedNote;
          existingComment.ModifiedOn = new Date();
          existingComment.ModifiedByID = userId;
          await transactionalManager.save(
            RecommendationCommentEntity,
            existingComment
          );

          // Log the updated comment
          console.log(
            `Updated comment for RecommendationID ${recommendationId}, NutrientID ${nutrientId}: ${concatenatedNote}`
          );
        } else {
          // Create new comment
          const newComment = this.recommendationCommentRepository.create({
            Nutrient: Number(nutrientId),
            Comment: concatenatedNote,
            RecommendationID: recommendationId,
            CreatedOn: new Date(),
            CreatedByID: userId,
            ModifiedOn: new Date(),
            ModifiedByID: userId,
          });
          recommendationComments.push(newComment);

          // Log the newly created comment
          console.log(
            `Created new comment for RecommendationID ${recommendationId}, NutrientID ${nutrientId}: ${concatenatedNote}`
          );
        }
      }

      // Delete comments that no longer have a matching nutrientId
      await transactionalManager.delete(RecommendationCommentEntity, {
        RecommendationID: recommendationId,
        Nutrient: Not(In(nutrientIdsInNotes)),
      });
    };

    // Process first crop comments if available
    if (savedData.firstCropSaveData) {
      await saveComments(
        firstCropNotesByNutrientId,
        savedData.firstCropSaveData.ID
      );
    }

    // Process second crop comments if available
    if (savedData.secondCropSaveData) {
      await saveComments(
        secondCropNotesByNutrientId,
        savedData.secondCropSaveData.ID
      );
    }

    // Save any new comments
    if (recommendationComments.length > 0) {
      await transactionalManager.save(
        RecommendationCommentEntity,
        recommendationComments
      );
      return recommendationComments;
    }
  }

  async getNutrientRecommendationsData(nutrientRecommendationnReqBody) {
    return await this.rB209RecommendationService.postData(
      "Recommendation/Recommendations",
      nutrientRecommendationnReqBody
    );
  }

  async buildArableBody(
    dataMultipleCrops, // Accept either a single crop or multiple crops
    field,
    transactionalManager,
    cropTypesList
  ) {
    const arableBody = [];

    // Ensure dataMultipleCrops is always treated as an array
    const crops = Array.isArray(dataMultipleCrops)
      ? dataMultipleCrops
      : [dataMultipleCrops];

    // Iterate over crops (single or multiple)
    for (const crop of crops) {
      const currentCropType = cropTypesList.find(
        (cropType) => cropType.cropTypeId === crop.CropTypeID
      );

      if (!currentCropType || currentCropType.cropGroupId == null) {
        throw new boom.HttpException(
          `Invalid CropTypeId for crop having field name ${field.Name}`,
          StaticStrings.HTTP_STATUS_BAD_REQUEST
        );
      }
      let expectedYield = crop.Yield,
        cropTypeLinkingData;
      if (expectedYield == null) {
        cropTypeLinkingData = await transactionalManager.findOne(
          CropTypeLinkingEntity,
          {
            where: {
              CropTypeID: crop.CropTypeID,
            },
          }
        );
        expectedYield = cropTypeLinkingData.DefaultYield;
      }
      if (crop.CropTypeID !== CropTypeMapper.GRASS) {
        arableBody.push({
          cropOrder: crop.CropOrder,
          cropGroupId: currentCropType.cropGroupId,
          cropTypeId: crop.CropTypeID,
          cropInfo1Id: crop.CropInfo1,
          cropInfo2Id: crop.CropInfo2,
          sowingDate: crop.SowingDate,
          expectedYield: expectedYield,
        });
      }
      // Add crop to arableBody based on its CropOrder
    }

    // Return the list of crops sorted by CropOrder (if necessary)
    return arableBody.sort((a, b) => a.cropOrder - b.cropOrder);
  }

  async buildNutrientRecommendationReqBody(
    field,
    farm,
    soilAnalysis,
    snsAnalysesData,
    dataMultipleCrops,
    crop,
    mannerOutputs,
    firstCropData,
    organicManureData,
    pkBalanceData,
    rb209CountryId,
    transactionalManager,
    request,
    cropTypesList
  ) {
    const grassGrowthClass =
      await this.grassGrowthClass.calculateGrassGrowthClassByFieldId(
        field.ID,
        request
      );
    const cropType = cropTypesList.find(
      (cropType) => cropType.cropTypeId === crop.CropTypeID
    );
    const crops = Array.isArray(dataMultipleCrops)
      ? dataMultipleCrops
      : [dataMultipleCrops];

    // Check if there are multiple crops or a single crop
    const isMultipleCrops =
      Array.isArray(dataMultipleCrops) && dataMultipleCrops.length > 1;

    if (!cropType || cropType.cropGroupId === null) {
      throw new boom.HttpException(
        `Invalid CropTypeId for crop having field name ${field.Name}`,
        StaticStrings.HTTP_STATUS_BAD_REQUEST
      );
    }

    const previousCrop =
      await this.CalculatePreviousCropService.findPreviousCrop(
        field.ID,
        crop.Year,
        transactionalManager
      );

    const arableBody = await this.buildArableBody(
      dataMultipleCrops,
      field,
      transactionalManager,
      cropTypesList
    );
    const grassObject = await this.buildGrassObject(
      crop,
      field,
      grassGrowthClass,
      transactionalManager
    );
    const isCropGrass = await this.isGrassCropPresent(
      crop,
      transactionalManager
    );
    const excessRainfall = await this.getWinterExcessRainfall(
      farm.ID,
      crop.Year
    );
    let grassHistoryID = null;
    let previousGrassId = null;
    const fieldType = await this.determineFieldType(crop, transactionalManager);

    if (crop.CropTypeID == CropTypeMapper.GRASS) {
      grassHistoryID = await this.calculateGrassId.getGrassHistoryID(
        field,
        crop,
        transactionalManager,
        crop.Year
      );
    } else {
      previousGrassId = await this.calculateGrassId.getPreviousGrassID(
        crop,
        transactionalManager,
        crop.Year
      );
    }

    const nutrientRecommendationnReqBody = {
      field: {
        fieldType: fieldType,
        multipleCrops: dataMultipleCrops.length > 1,
        arable: fieldType == FieldTypeMapper.GRASS ? [] : arableBody,
        grassland: {},
        grass:
          fieldType == FieldTypeMapper.BOTH ||
          fieldType == FieldTypeMapper.GRASS
            ? grassObject
            : {},
        soil: {
          soilTypeId: field.SoilTypeID,
          kReleasingClay: field.SoilReleasingClay,
          nvzActionProgrammeId: field.NVZProgrammeID,
          psc: 0, // need to find it
          pkBalance: {
            phosphate: pkBalanceData == null ? 0 : pkBalanceData.PBalance,
            potash: pkBalanceData == null ? 0 : pkBalanceData.KBalance,
          },
          soilAnalyses: [],
        },
        harvestYear: crop.Year,
        rainfallAverage: farm.Rainfall,
        excessWinterRainfall:
          excessRainfall?.WinterRainfall == null
            ? 0
            : excessRainfall?.WinterRainfall, // need to find it
        mannerManures: true,
        organicMaterials: [],
        mannerOutputs: [],
        previousCropping: {},
        countryId: rb209CountryId,
      },
      nutrients: {
        nitrogen: true,
        phosphate: true,
        potash: true,
        magnesium: true,
        sodium: true,
        sulphur: true,
        lime: true,
      },
      totals: true,
      referenceValue: `${field.ID}-${crop.ID}-${crop.Year}`,
    };
    nutrientRecommendationnReqBody.field.mannerOutputs = mannerOutputs;
    // Add SoilAnalyses data
    if (soilAnalysis) {
      soilAnalysis.forEach((soilAnalysis) => {
        const soilAnalysisData = {
          ...(soilAnalysis.Date != null && {
            soilAnalysisDate: soilAnalysis.Date,
          }),
          ...(soilAnalysis.PH != null && { soilpH: soilAnalysis.PH }),
          ...(soilAnalysis.SulphurDeficient != null && {
            sulphurDeficient: soilAnalysis.SulphurDeficient,
          }),
          ...(soilAnalysis.PhosphorusIndex != null && {
            pIndexId: soilAnalysis.PhosphorusIndex,
            pMethodologyId: soilAnalysis.PhosphorusMethodologyID,
          }),
          ...(soilAnalysis.PotassiumIndex != null && {
            kIndexId: soilAnalysis.PotassiumIndex,
            kMethodologyId: 4,
          }),
          ...(soilAnalysis.MagnesiumIndex != null && {
            mgIndexId: soilAnalysis.MagnesiumIndex,
            mgMethodologyId: 4,
          }),
        };

        // Only push if there's actual data
        if (Object.keys(soilAnalysisData).length > 0) {
          nutrientRecommendationnReqBody.field.soil.soilAnalyses.push(
            soilAnalysisData
          );
        }
      });
    }

    // Add SnsAnalyses data
    if (Array.isArray(snsAnalysesData)) {
      snsAnalysesData.forEach((analysis) => {
        const snsAnalysisData = {
          ...(analysis.SampleDate != null && {
            soilAnalysisDate: analysis.SampleDate,
          }),
          ...(analysis.SoilNitrogenSupplyIndex != null && {
            snsIndexId: analysis.SoilNitrogenSupplyIndex,
            snsMethodologyId: 4,
          }),
          ...(analysis.SNSCropOrder != null && {
            SNSCropOrder: analysis.SNSCropOrder,
          }),
        };

        // Only push if there's actual data
        if (Object.keys(snsAnalysisData).length > 0) {
          nutrientRecommendationnReqBody.field.soil.soilAnalyses.push(
            snsAnalysisData
          );
        }
      });
    } else if (snsAnalysesData) {
      const snsAnalysisData = {
        ...(snsAnalysesData.SampleDate != null && {
          soilAnalysisDate: snsAnalysesData.SampleDate,
        }),
        ...(snsAnalysesData.SoilNitrogenSupplyIndex != null && {
          snsIndexId: snsAnalysesData.SoilNitrogenSupplyIndex,
          snsMethodologyId: 4,
        }),
        ...(snsAnalysesData.SNSCropOrder != null && {
          SNSCropOrder: snsAnalysesData.SNSCropOrder,
        }),
      };

      // Only push if there's actual data
      if (Object.keys(snsAnalysisData).length > 0) {
        nutrientRecommendationnReqBody.field.soil.soilAnalyses.push(
          snsAnalysisData
        );
      }
    }

    if (previousCrop) {
      const cropType = cropTypesList.find(
        (cropType) => cropType.cropTypeId === previousCrop.CropTypeID
      );
      nutrientRecommendationnReqBody.field.previousCropping = {
        previousGrassId: grassHistoryID ? null : previousGrassId,
        previousCropGroupId:
          previousCrop?.CropTypeID == CropTypeMapper.GRASS
            ? null
            : cropType.cropGroupId !== undefined &&
              cropType.cropGroupId !== null
            ? cropType.cropGroupId
            : null,
        previousCropTypeId:
          previousCrop?.CropTypeID == CropTypeMapper.GRASS
            ? null
            : previousCrop.CropTypeID !== undefined &&
              previousCrop.CropTypeID !== null
            ? previousCrop.CropTypeID
            : null,
        grassHistoryId: previousGrassId ? null : grassHistoryID,
        snsId: null,
        smnDepth: null,
        measuredSmn: null,
      };
    } else {
      // If no previousCrop found, assign null except for previousGrassId
      nutrientRecommendationnReqBody.field.previousCropping = {
        previousCropGroupId: null,
        previousCropTypeId: null,
        previousGrassId:
          previousCrop?.CropTypeID == CropTypeMapper.GRASS ? null : 1,
        grassHistoryId: null,
        snsId: null,
        smnDepth: null,
        measuredSmn: null,
      };
    }
    nutrientRecommendationnReqBody.referenceValue = `${field.ID}-${crop.ID}-${crop.Year}`;

    return nutrientRecommendationnReqBody;
  }

  async findPreviousCrop(transactionalManager, fieldID, currentYear) {
    // Find all crops matching the previous year and field ID
    const previousCrops = await transactionalManager.find(CropEntity, {
      where: {
        FieldID: fieldID,
        Year: currentYear - 1,
      },
    });

    let prevCrop = null;
    if (previousCrops.length == 0) {
      // Check PreviousCrop
      prevCrop = await transactionalManager.findOne(PreviousCroppingEntity, {
        where: { FieldID: fieldID, HarvestYear: currentYear - 1 },
      });
      return prevCrop;
    }

    // If more than one crop is found, filter for CropOrder = 2
    if (previousCrops.length > 1) {
      return previousCrops.find(
        (crop) => crop.CropOrder === CropOrderMapper.SECONDCROP
      );
    }

    // Otherwise, return the first crop (or null if none are found)
    return previousCrops[0] || null;
  }

  async buildGrassObject(crop, field, grassGrowthClass, transactionalManager) {
    let grassCrop = null;

    if (crop.CropTypeID === CropTypeMapper.GRASS) {
      grassCrop = crop;
    } else {
      grassCrop = await transactionalManager.findOne(CropEntity, {
        where: {
          FieldID: crop.FieldID,
          Year: crop.Year,
          CropTypeID: CropTypeMapper.GRASS,
          ID: Not(crop.ID), // exclude the current crop
        },
      });
    }

    if (!grassCrop) {
      return {};
    }

    if (grassCrop.CropOrder === CropOrderMapper.FIRSTCROP) {
      return {
        cropOrder: grassCrop.CropOrder,
        swardTypeId: grassCrop.SwardTypeID,
        swardManagementId: grassCrop.SwardManagementID,
        defoliationSequenceId: grassCrop.DefoliationSequenceID,
        grassGrowthClassId: grassGrowthClass.grassGrowthClassId,
        yield: grassCrop.Yield,
        seasonId: grassCrop.Establishment,
      };
    }

    if (grassCrop.CropOrder === CropOrderMapper.SECONDCROP) {
      return {
        cropOrder: grassCrop.CropOrder,
        swardTypeId: grassCrop.SwardTypeID,
        swardManagementId: grassCrop.SwardManagementID,
        defoliationSequenceId: grassCrop.DefoliationSequenceID,
        grassGrowthClassId: grassGrowthClass.grassGrowthClassId,
        yield: grassCrop.Yield,
        seasonId: grassCrop.Establishment,
      };
    }

    return {};
  }

  async isGrassCropPresent(crop, transaction) {
    if (crop.CropOrder === CropOrderMapper.FIRSTCROP) {
      if (crop.CropTypeID === CropTypeMapper.GRASS) {
        return true;
      } else {
        return false;
      }
    } else if (crop.CropOrder === CropOrderMapper.SECONDCROP) {
      if (crop.CropTypeID === CropTypeMapper.GRASS) {
        return true;
      } else {
        const firstCropData = await this.getFirstCropData(
          transaction,
          crop.FieldID,
          crop.Year
        );
        if (firstCropData.CropTypeID === CropTypeMapper.GRASS) {
          return true;
        } else {
          return false;
        }
      }
    }
  }

  async buildNutrientWithoutMannerRecommendationReqBody(
    field,
    farm,
    soilAnalysis,
    snsAnalysesData,
    dataMultipleCrops,
    crop,
    pkBalanceData,
    transactionalManager,
    rb209CountryId,
    request,
    cropTypesList
  ) {
    const grassGrowthClass =
      await this.grassGrowthClass.calculateGrassGrowthClassByFieldId(
        field.ID,
        request
      );

    const grassObject = await this.buildGrassObject(
      crop,
      field,
      grassGrowthClass,
      transactionalManager
    );
    const cropType = cropTypesList.find(
      (cropType) => cropType.cropTypeId === crop.CropTypeID
    );

    if (!cropType || cropType.cropGroupId === null) {
      throw boom.HttpException(
        `Invalid CropTypeId for crop having field name ${field.Name}`,
        StaticStrings.HTTP_STATUS_BAD_REQUEST
      );
    }

    const previousCrop =
      await this.CalculatePreviousCropService.findPreviousCrop(
        field.ID,
        crop.Year,
        transactionalManager
      );

    const excessRainfall = await this.getWinterExcessRainfall(
      farm.ID,
      crop.Year
    );

    const isCropGrass = await this.isGrassCropPresent(
      crop,
      transactionalManager
    );

    // Use the buildArableBody function to get the arable array
    const arableBody = await this.buildArableBody(
      dataMultipleCrops,
      field,
      transactionalManager,
      cropTypesList
    );
    let grassHistoryID = null;
    let previousGrassId = null;
    const fieldType = await this.determineFieldType(crop, transactionalManager);
    if (crop.CropTypeID == CropTypeMapper.GRASS) {
      grassHistoryID = await this.calculateGrassId.getGrassHistoryID(
        field,
        crop,
        transactionalManager,
        crop.Year
      );
    } else {
      previousGrassId = await this.calculateGrassId.getPreviousGrassID(
        crop,
        transactionalManager,
        crop.Year
      );
    }
    const nutrientRecommendationnReqBody = {
      field: {
        fieldType: fieldType,
        multipleCrops: dataMultipleCrops.length > 1 ? true : false,
        arable: fieldType == FieldTypeMapper.GRASS ? [] : arableBody,
        grassland: {},
        grass:
          fieldType == FieldTypeMapper.BOTH ||
          fieldType == FieldTypeMapper.GRASS
            ? grassObject
            : {},
        soil: {
          soilTypeId: field.SoilTypeID,
          kReleasingClay: field.SoilReleasingClay,
          nvzActionProgrammeId: field.NVZProgrammeID,
          psc: 0, //need to find it
          pkBalance: {
            phosphate: pkBalanceData == null ? 0 : pkBalanceData.PBalance,
            potash: pkBalanceData == null ? 0 : pkBalanceData.KBalance,
          },
          soilAnalyses: [],
        },
        harvestYear: crop.Year,
        rainfallAverage: farm.Rainfall,
        excessWinterRainfall:
          excessRainfall?.WinterRainfall == null
            ? 0
            : excessRainfall.WinterRainfall, //need to find it
        organicMaterials: [],
        previousCropping: {},
        countryId: rb209CountryId,
      },
      nutrients: {
        nitrogen: true,
        phosphate: true,
        potash: true,
        magnesium: true,
        sodium: true,
        sulphur: true,
        lime: true,
      },
      totals: true,
      referenceValue: `${field.ID}-${crop.ID}-${crop.Year}`,
    };
    // Add SoilAnalyses data
    if (soilAnalysis) {
      soilAnalysis.forEach((soilAnalysis) => {
        const soilAnalysisData = {
          ...(soilAnalysis.Date != null && {
            soilAnalysisDate: soilAnalysis.Date,
          }),
          ...(soilAnalysis.PH != null && { soilpH: soilAnalysis.PH }),
          ...(soilAnalysis.SulphurDeficient != null && {
            sulphurDeficient: soilAnalysis.SulphurDeficient,
          }),
          ...(soilAnalysis.PhosphorusIndex != null && {
            pIndexId: soilAnalysis.PhosphorusIndex,
            pMethodologyId: soilAnalysis.PhosphorusMethodologyID,
          }),
          ...(soilAnalysis.PotassiumIndex != null && {
            kIndexId: soilAnalysis.PotassiumIndex,
            kMethodologyId: 4,
          }),
          ...(soilAnalysis.MagnesiumIndex != null && {
            mgIndexId: soilAnalysis.MagnesiumIndex,
            mgMethodologyId: 4,
          }),
        };

        // Only push if there's actual data
        if (Object.keys(soilAnalysisData).length > 0) {
          nutrientRecommendationnReqBody.field.soil.soilAnalyses.push(
            soilAnalysisData
          );
        }
      });
    }

    // Add SnsAnalyses data
    if (Array.isArray(snsAnalysesData)) {
      snsAnalysesData.forEach((analysis) => {
        const snsAnalysisData = {
          ...(analysis.SampleDate != null && {
            soilAnalysisDate: analysis.SampleDate,
          }),
          ...(analysis.SoilNitrogenSupplyIndex != null && {
            snsIndexId: analysis.SoilNitrogenSupplyIndex,
            snsMethodologyId: 4,
          }),
          ...(analysis.SNSCropOrder != null && {
            SNSCropOrder: analysis.SNSCropOrder,
          }),
        };

        // Only push if there's actual data
        if (Object.keys(snsAnalysisData).length > 0) {
          nutrientRecommendationnReqBody.field.soil.soilAnalyses.push(
            snsAnalysisData
          );
        }
      });
    } else if (snsAnalysesData) {
      const snsAnalysisData = {
        ...(snsAnalysesData.SampleDate != null && {
          soilAnalysisDate: snsAnalysesData.SampleDate,
        }),
        ...(snsAnalysesData.SoilNitrogenSupplyIndex != null && {
          snsIndexId: snsAnalysesData.SoilNitrogenSupplyIndex,
          snsMethodologyId: 4,
        }),
        ...(snsAnalysesData.SNSCropOrder != null && {
          SNSCropOrder: snsAnalysesData.SNSCropOrder,
        }),
      };

      // Only push if there's actual data
      if (Object.keys(snsAnalysisData).length > 0) {
        nutrientRecommendationnReqBody.field.soil.soilAnalyses.push(
          snsAnalysisData
        );
      }
    }

    if (previousCrop) {
      const cropType = cropTypesList.find(
        (cropType) => cropType?.cropTypeId === previousCrop?.CropTypeID
      );
      nutrientRecommendationnReqBody.field.previousCropping = {
        previousGrassId: grassHistoryID ? null : previousGrassId,
        previousCropGroupId:
          previousCrop?.CropTypeID == CropTypeMapper.GRASS
            ? null
            : cropType?.cropGroupId !== undefined &&
              cropType?.cropGroupId !== null
            ? cropType?.cropGroupId
            : null,
        previousCropTypeId:
          previousCrop?.CropTypeID == CropTypeMapper.GRASS
            ? null
            : previousCrop?.CropTypeID !== undefined &&
              previousCrop?.CropTypeID !== null
            ? previousCrop?.CropTypeID
            : null,
        grassHistoryId: previousGrassId ? null : grassHistoryID,
        snsId: null,
        smnDepth: null,
        measuredSmn: null,
      };
    } else {
      // If no previousCrop found, assign null except for previousGrassId
      nutrientRecommendationnReqBody.field.previousCropping = {
        previousCropGroupId: null,
        previousCropTypeId: null,
        previousGrassId:
          previousCrop?.CropTypeID == CropTypeMapper.GRASS ? null : 1,
        grassHistoryId: null,
        snsId: null,
        smnDepth: null,
        measuredSmn: null,
      };
    }
    nutrientRecommendationnReqBody.referenceValue = `${field.ID}-${crop.ID}-${crop.Year}`;

    return nutrientRecommendationnReqBody;
  }
  async getSnsAnalysesData(transactionalManager, crop) {
    const data = await transactionalManager.findOne(SnsAnalysesEntity, {
      where: { CropID: crop.ID },
    });

    if (data) {
      return {
        ...data,
        SNSCropOrder: crop.CropOrder,
      };
    }
  }

  async getCrops(fieldID, year) {
    return this.cropRepository.find({
      where: { FieldID: fieldID, Year: year },
    });
  }
  async findIndexId(nutrient, indexValue, nutrientIndicesData) {
    // Return null immediately if indexValue is null
    if (indexValue === null) {
      return null;
    }
    const nutrientData = nutrientIndicesData[nutrient];

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
    const nutrientIndicesData = {};

    // Loop through each soil analysis record
    for (const record of soilAnalysisRecords) {
      // Loop through NutrientMapper to process each nutrient
      for (const nutrient of NutrientMapperNames) {
        const { nutrientId, nutrient: nutrientName, countryId } = nutrient;

        // Fetch data for each nutrient and country
        const getNutrientData = await this.RB209SoilService.getData(
          `Soil/Methodologies/${nutrientId}/${countryId}`
        );

        const methodologyId = getNutrientData[0]?.methodologyId;

        if (methodologyId != null) {
          // Use dynamic countryId for the NutrientIndices API call
          nutrientIndicesData[nutrientName] =
            await this.RB209SoilService.getData(
              `Soil/NutrientIndices/${nutrientId}/${methodologyId}/${rb209CountryId}`
            );
        }

        // Dynamically assign indexId to each nutrient in soil analysis record
        const nutrientIndexKey = `${nutrientName}Index`; // e.g., "PhosphateIndex"
        if (record[nutrientIndexKey] !== undefined) {
          const nutrientIndexId = await this.findIndexId(
            nutrientName,
            record[nutrientIndexKey],
            nutrientIndicesData
          );

          record[nutrientIndexKey] =
            nutrientIndexId || record[nutrientIndexKey]; // Update the index with indexId
        }
      }
    }

    return soilAnalysisRecords;
  }
  async convertIndexValueToId(indexId, nutrientId) {
    const numericIndexId = Number(indexId);
    // Convert nutrientId to a string
    const numericNutrientId = Number(nutrientId);
    const indexValue = await this.RB209SoilService.getData(
      `Soil/NutrientIndex/${numericIndexId}/${numericNutrientId}`
    );
    const trimmedIndexValue = indexValue.index.trim();

    return trimmedIndexValue;
  }
  async handleSoilAnalysisValidation(
    fieldId,
    fieldName,
    year,
    rb209CountryId,
    transactionalManager
  ) {
    const errors = [];
    const fiveYearsAgo = year - 4;

    // // Fetch all soil analyses for the last 5 years

    const soilAnalysisRecordsFiveYears = await transactionalManager.find(
      SoilAnalysisEntity,
      {
        where: {
          FieldID: fieldId,
          Year: Between(fiveYearsAgo, year),
        },
        order: { Date: "DESC" },
      }
    );

    // Define the fields we want the latest values for
    const fieldsToTrack = [
      "PH",
      "SoilNitrogenSupplyIndex",
      "PhosphorusIndex",
      "PotassiumIndex",
      "MagnesiumIndex",
    ];

    // Initialize the latest values object
    const latestSoilAnalysis = {};
    if (soilAnalysisRecordsFiveYears.length > 0) {
      fieldsToTrack.forEach((field) => {
        // Set default value to null
        latestSoilAnalysis[field] = null;
        // Find the first record in descending date order where the field has a value
        const latestRecordWithFieldValue = soilAnalysisRecordsFiveYears.find(
          (record) => record[field] !== null && record[field] !== undefined
        );

        // If a valid record with the field is found, assign the value; otherwise, leave it as null
        if (latestRecordWithFieldValue) {
          latestSoilAnalysis[field] = latestRecordWithFieldValue[field];
        } else {
          // Explicitly set the field to null if no value was found
          latestSoilAnalysis[field] = null;
        }
        // Debugging: Log the process to check what happens with SoilNitrogenSupplyIndex
        if (field === "SoilNitrogenSupplyIndex") {
          console.log("Processing SoilNitrogenSupplyIndex");
          console.log("Records:", soilAnalysisRecordsFiveYears);
          console.log("Latest Record with Value:", latestRecordWithFieldValue);
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
  async getWinterExcessRainfall(farmId, year) {
    const excessRainfall = await this.excessRainfallRepository.findOne({
      where: {
        FarmID: farmId,
        Year: year,
      },
    });
    if (excessRainfall) {
      return excessRainfall;
    } else {
      return null;
    }
  }
  async getManagementPeriods(transactionalManager, cropIds) {
    return await transactionalManager.find(ManagementPeriodEntity, {
      where: { CropID: In(cropIds) },
      select: ["ID", "CropID"],
    });
  }

  async getManagementPeriod(transactionalManager, id) {
    const data = await transactionalManager.findOne(ManagementPeriodEntity, {
      where: {
        CropID: id,
      },
    });

    return data;
  }

  async getOrganicManures(managementPeriods, transactionalManager) {
    const managementPeriodIDs = managementPeriods.map((mp) => mp.ID);

    return await transactionalManager.find(OrganicManureEntity, {
      where: { ManagementPeriodID: In(managementPeriodIDs) },
    });
  }
  async getManureTypeData(manureTypeID, request) {
    try {
      // Attempt to fetch data from the MannerManureTypesService
      const manureTypeData = await this.MannerManureTypesService.getData(
        `/manure-types/${manureTypeID}`,
        request
      );
      return manureTypeData;
    } catch (error) {
      // If an error occurs (e.g., timeout), log the error and fallback to in-memory data
      console.error(
        `Error fetching manure type data for ID ${manureTypeID}:`,
        error.message
      );
    }
  }

  async buildManureApplications(
    managementPeriodID,
    organicManureAllData,
    organicManure,
    request
  ) {
    // Filter organic manure data based on ManagementPeriodID
    const mulOrganicManuresData = organicManureAllData?.filter(
      (manure) => manure.ManagementPeriodID === managementPeriodID
    );

    const manureApplications = [];

    // Use for...of loop to handle each manure and get manureTypeData
    for (const manure of mulOrganicManuresData) {
      // Fetch manureTypeData based on ManureTypeID for the current manure
      const manureTypeData = await this.getManureTypeData(
        manure.ManureTypeID,
        request
      );

      // Push the processed manure application details to the array
      manureApplications.push({
        manureDetails: {
          manureID: manure.ManureTypeID,
          name: manureTypeData.data.name,
          isLiquid: manureTypeData.data.isLiquid,
          dryMatter: manure.DryMatterPercent,
          totalN: manure.N,
          nH4N: manure.NH4N,
          uric: manure.UricAcid,
          nO3N: manure.NO3N,
          p2O5: manure.P2O5,
          sO3: manure.SO3,
          k2O: manure.K2O,
          mgO: manure.MgO,
        },
        applicationDate: new Date(manure.ApplicationDate)
          .toISOString()
          .split("T")[0],
        applicationRate: {
          value: manure.ApplicationRate,
          unit: "kg/hectare",
        },
        applicationMethodID: manure.ApplicationMethodID,
        incorporationMethodID: manure.IncorporationMethodID,
        incorporationDelayID: manure.IncorporationDelayID,
        autumnCropNitrogenUptake: {
          value: manure.AutumnCropNitrogenUptake,
          unit: "string",
        },
        endOfDrainageDate: new Date(manure.EndOfDrain)
          .toISOString()
          .split("T")[0],
        rainfallPostApplication: manure.Rainfall,
        windspeedID: manure.WindspeedID,
        rainTypeID: manure.RainfallWithinSixHoursID,
        topsoilMoistureID: manure.MoistureID,
      });
    }

    // Return the array containing all manure applications
    return manureApplications;
  }

  async buildMannerOutputReq(
    fieldID,
    manureApplications,
    request,
    cropData,
    farmData,
    fieldData,
    cropTypeLinkingData,
    soilTypeTextureData
  ) {
    return {
      runType: farmData.EnglishRules ? 3 : 4,
      postcode: farmData.ClimateDataPostCode.split(" ")[0],
      countryID: farmData.EnglishRules ? 1 : 2,
      field: {
        fieldID: fieldData.ID,
        fieldName: fieldData.Name,
        MannerCropTypeID: cropTypeLinkingData.MannerCropTypeID,
        topsoilID: soilTypeTextureData?.TopSoilID,
        subsoilID: soilTypeTextureData?.SubSoilID,
        isInNVZ: fieldData.IsWithinNVZ,
      },
      manureApplications,
    };
  }

  async processMannerOutputs(mannerOutputReq, request) {
    const mannerOutputData =
      await this.MannerCalculateNutrientsService.postData(
        "/calculate-nutrients",
        mannerOutputReq,
        request
      );

    if (!mannerOutputData.data) {
      throw new Error("Vendor manner API is not working");
    }

    return mannerOutputData;
  }
}

module.exports = { UpdateRecommendationChanges };
