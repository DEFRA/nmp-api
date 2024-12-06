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
const { CleanPlugin } = require("webpack");

class UpdateRecommendation {
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

    this.fieldRespository = AppDataSource.getRepository(FieldEntity);
    this.farmRespository = AppDataSource.getRepository(FarmEntity);
    this.MannerCalculateNutrientsService =
      new MannerCalculateNutrientsService();
    this.snsAnalysisRepository = AppDataSource.getRepository(SnsAnalysesEntity);
    this.soilAnalysisRepository =
      AppDataSource.getRepository(SoilAnalysisEntity);
    this.recommendationCommentRepository = AppDataSource.getRepository(
      RecommendationCommentEntity
    );
    this.fertiliserRepository = AppDataSource.getRepository(
      FertiliserManuresEntity
    );
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
  async updateRecommendationsForField(fieldID, year, request, userId) {
    console.log("function started");
    console.log("year",year);
    console.log("fieldID",fieldID);
    // Fetch all years greater than the provided year for the given FieldID
    const yearsGreaterThanGivenYear = await this.getYearsGreaterThanGivenYear(
      fieldID,
      year
    );
    console.log("yearsGreaterThanGivenYear", yearsGreaterThanGivenYear);
    // Execute the original year synchronously and return its result
    const originalYearResult = await this.updateRecommendationAndOrganicManure(
      fieldID,
      year,
      request,
      userId
    );
    if (yearsGreaterThanGivenYear) {
      // Execute the remaining years asynchronously (background process)
      this.processRemainingYearsInBackground(
        fieldID,
        yearsGreaterThanGivenYear,
        request,
        userId
      );
    }
    // Return the result for the original year
    return originalYearResult;
  }

  async processRemainingYearsInBackground(fieldID, years, request, userId) {
    console.log("multiple years started", years);
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

  async updateRecommendationAndOrganicManure(fieldID, year, request, userId) {
    console.log("second fucntion started");
    console.log("YUUUUU", year);
    let flag = true;
    return await AppDataSource.transaction(async (transactionalManager) => {
      const organicManureAllData = await this.getAllOrganicManure();
      const crops = await this.getCrops(fieldID, year);

      if (crops.length > 0) {
        // console.error("No crops found for the given Year and FieldID");
        //}
        const cropIds = crops.map((crop) => crop.ID);

        const managementPeriods = await this.getManagementPeriods(cropIds);
        console.log("cropIdsssss", cropIds);
        console.log("managsssementPeriods", managementPeriods);
        if (managementPeriods.length === 0) {
          throw new Error("No Management Periods found for the selected crops");
        }
        const organicManuresData = [];

        const organicManures = await this.getOrganicManures(managementPeriods);
        console.log("organicManures", organicManures);
        const allRecommendations = await this.RecommendationRepository.find();
        if (organicManures.length > 0) {
          console.log("line no 156");
          await this.saveRecommendationWithManure(
            organicManures,
            organicManureAllData,
            request,
            fieldID,
            transactionalManager,
            userId,
            allRecommendations,
            year
          );
        } else {
          console.log("line no 167");
          await this.saveRecommendationWithoutManure(
            crops,
            organicManures,
            organicManureAllData,
            request,
            fieldID,
            transactionalManager,
            userId,
            allRecommendations,
            year
          );
        }
      }
    });
  }

  async saveRecommendationWithManure(
    organicManures,
    organicManureAllData,
    request,
    fieldID,
    transactionalManager,
    userId,
    allRecommendations,
    year
  ) {
    console.log("FUNCTION WITH MANURE STARTED");
    for (const organicManure of organicManures) {
      console.log("FUNCTION WITH MANURE STARTED INSIDE LOOP");

      const manureApplications = await this.buildManureApplications(
        organicManure.ManagementPeriodID,
        organicManureAllData,
        request
      );

      const managementPeriodData =
        await this.managementPeriodRepository.findOneBy({
          ID: organicManure.ManagementPeriodID,
        });
      const cropData = await this.cropRepository.findOneBy({
        ID: managementPeriodData.CropID,
      });

      const fieldData = await this.fieldRespository.findOne({
        where: { ID: fieldID },
      });
      const farmData = await this.farmRespository.findOne({
        where: { ID: fieldData.FarmID },
      });
      const cropTypeLinkingData =
        await this.CropTypeLinkingRepository.findOneBy({
          CropTypeID: fieldData.TopSoilID,
        });

      const Errors = [];
      const {
        latestSoilAnalysis,
        errors: soilAnalysisErrors,
        soilAnalysisRecords,
      } = await this.handleSoilAnalysisValidation(
        fieldData.ID,
        fieldData.Name,
        cropData?.Year
      );
      Errors.push(...soilAnalysisErrors);

      if (Errors.length > 0) {
        throw new HttpException(JSON.stringify(Errors), HttpStatus.BAD_REQUEST);
      }
      const pkBalanceData = await this.getPKBalanceData(
        cropData?.Year - 1,
        fieldData.ID
      );

      const mannerOutputReq = await this.buildMannerOutputReq(
        fieldID,
        manureApplications,
        request,
        cropData,
        farmData,
        fieldData,
        cropTypeLinkingData
      );

      const mannerOutputs = await this.processMannerOutputs(
        mannerOutputReq,
        request
      );
      const dataMultipleCrops = await this.cropRepository.find({
        where: {
          FieldID: fieldData.ID,
          Year: cropData.Year,
          Confirm: false,
        },
      });
      let nutrientRecommendationsData;
      const snsAnalysesData = await this.getSnsAnalysesData(fieldData.ID);
      const secondCropManagementData = await this.getManagementPeriod(cropData.ID);
      let fertiliserData = await this.getFertiliserData(
        organicManure.ManagementPeriodID
      );
      console.log("cropDatdddda", cropData);
      //console.log("organicManuresDatamkmkmk", organicManuresData);
      //get PKBalance data
      let pkBalance = await this.getPKBalanceData(cropData?.Year, fieldData.ID);
      if (cropData.CropTypeID === 170) {
        // await this.saveOrganicManureForOtherCropType(
        //   organicManure,
        //   mannerOutputs,
        //   transactionalManager,
        //   userId,
        //   organicManuresData
        // );

        const otherRecommendations = await this.saveRecommendationForOtherCrops(
          transactionalManager,
          organicManure,
          mannerOutputs,
          userId,
          latestSoilAnalysis,
          snsAnalysesData,
          allRecommendations
        );
        console.log("otherRecommendations", otherRecommendations);
        console.log("pkBalance111", pkBalance);
        console.log("333", pkBalance);
        let saveAndUpdatePKBalance = await this.UpdatePKBalance(
          fieldData.ID,
          cropData,
          nutrientRecommendationsData,
          pkBalance,
          userId,
          secondCropManagementData,
          fertiliserData,
          year
        );

        if (saveAndUpdatePKBalance) {
          await transactionalManager.save(
            PKBalanceEntity,
            saveAndUpdatePKBalance.saveAndUpdatePKBalance
          );
        }

        return { OrganicManures: organicManures };
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
          organicManure
        );

      nutrientRecommendationsData = await this.getNutrientRecommendationsData(
        nutrientRecommendationnReqBody
      );

      let arableNotes = nutrientRecommendationsData.adviceNotes;

      const savedData = await this.saveRecommendationsForMultipleCrops(
        transactionalManager,
        nutrientRecommendationsData,
        userId,
        cropData,
        dataMultipleCrops,
        latestSoilAnalysis,
        snsAnalysesData,
        allRecommendations
      );
      console.log("pkBalance111", pkBalance);
      console.log("4444", pkBalance);
      let saveAndUpdatePKBalance = await this.UpdatePKBalance(
        fieldData.ID,
        cropData,
        nutrientRecommendationsData,
        pkBalance,
        userId,
        secondCropManagementData,
        fertiliserData,
        year
      );

      if (saveAndUpdatePKBalance) {
        await transactionalManager.save(
          PKBalanceEntity,
          saveAndUpdatePKBalance.saveAndUpdatePKBalance
        );
      }

      console.log("savedDatasss", savedData);
      await this.saveOrUpdateArableNotes(
        arableNotes,
        savedData,
        transactionalManager,
        userId
      );
      console.log(
        "nutrientRecommendationsDatsssa",
        nutrientRecommendationsData
      );
      return nutrientRecommendationsData;
    }
  }

  async saveRecommendationWithoutManure(
    crops,
    organicManures,
    organicManureAllData,
    request,
    fieldID,
    transactionalManager,
    userId,
    allRecommendations,
    year
  ) {
    console.log("WITHOUT MANURE STARTED");
    const Recommendations = [];
    const Errors = [];
    console.log("crops111", crops);
    for (const crop of crops) {
      console.log("crop1", crops);
      console.log("WITHOUT MANURE STARTED INSIDE LOOP");

      const errors = await this.handleCropValidation(crop);
      const fieldId = crop.FieldID;
      const pkBalanceData = await this.getPKBalanceData(
        crop?.Year - 1,
        fieldId
      );

      console.log("pkBalanceData", pkBalanceData);
      const cropPlanOfNextYear = await this.getCropPlanOfNextYear(
        crop?.Year,
        fieldId
      );
      const { field, errors: fieldErrors } = await this.handleFieldValidation(
        fieldId
      );
      const { farm, errors: farmErrors } = await this.handleFarmValidation(
        field.FarmID
      );
       const dataMultipleCrops = await this.cropRepository.find({
         where: {
           FieldID: field.ID,
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
        crop?.Year
      );
      Errors.push(...soilAnalysisErrors);
      if (Errors.length > 0) {
        throw new Error(JSON.stringify(Errors));
      }

      Errors.push(...soilAnalysisErrors);
      if (Errors.length > 0) {
        throw new Error(JSON.stringify(Errors));
      }
      
      const secondCropManagementData = await this.getManagementPeriod(crop.ID);
      let fertiliserData = await this.getFertiliserData(
        secondCropManagementData.ID
      );
      console.log("fertiliserDataaaa", fertiliserData);
      console.log("secondCropManagementData.ID", secondCropManagementData.ID);
      const snsAnalysesData = await this.getSnsAnalysesData(fieldId);
      let nutrientRecommendationsData;
      //get PKBalance data
      let pkBalance = await this.getPKBalanceData(crop?.Year, fieldId);
      console.log("cropData", crop.CropInfo1);
      if (crop.CropTypeID === 170 || crop.CropInfo1 === null) {
        console.log("pkBalance111", pkBalance);        
        try {
          console.log("otherCase");
          console.log(
            "nutrientRecommendationsData",
            nutrientRecommendationsData
          );
          let saveAndUpdatePKBalance = await this.UpdatePKBalance(
            fieldId,
            crop,
            nutrientRecommendationsData,
            pkBalance,
            userId,
            secondCropManagementData,
            fertiliserData,
            year
          );
          console.log("saveAndUpdatePKBalance", saveAndUpdatePKBalance);

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

        console.log("cropPlanOfNextYear", cropPlanOfNextYear);

        return {
          message: "Default crop saved and exiting early",
          Recommendations,
        };
      } else {
        console.log("forOtherCrop");
       

        console.log("callingggg");
        const nutrientRecommendationnReqBody =
          await this.buildNutrientWithoutMannerRecommendationReqBody(
            field,
            farm,
            soilAnalysisRecords,
            snsAnalysesData,
            dataMultipleCrops,
            crop,
            pkBalanceData
          );
        console.log(
          "nutrientRecommendationnWithoutMannerReqBody",
          nutrientRecommendationnReqBody.arable
        );
        nutrientRecommendationsData = await this.getNutrientRecommendationsData(
          nutrientRecommendationnReqBody
        );
        console.log(
          "nutrientRecommendationsDataWithout",
          nutrientRecommendationsData
        );
        console.log("pkBalance111", pkBalance);
        console.log("2222", pkBalance);
        try {
          let saveAndUpdatePKBalance = await this.UpdatePKBalance(
            fieldId,
            crop,
            nutrientRecommendationsData,
            pkBalance,
            userId,
            secondCropManagementData,
            fertiliserData,
            year
          );
          console.log("saveAndUpdatePKBalance", saveAndUpdatePKBalance);
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
      console.log("crop.CopOrdere", crop.CropOrder);
      if (crop.CropOrder == 2) {
        const firstCropData = await this.getFirstCropData(field.ID, crop.Year);

        const managementPeriodData = await this.getManagementPeriod(
          firstCropData.ID
        );
        console.log("managementPeriodData", managementPeriodData.ID);
        const savedMultipleCropRecommendation =
          await this.saveRecommendationForMutipleCrops(
            transactionalManager,
            nutrientRecommendationsData,
            savedCrop,
            firstCropData,
            managementPeriodData,
            secondCropManagementData,
            latestSoilAnalysis,
            snsAnalysesData,
            userId
          );
        console.log(
          "savedMultipleCropRecommendationWithpout",
          savedMultipleCropRecommendation
        );

        const savedFirstRecommendationComment =
          await this.saveMultipleRecommendation(
            Recommendations,
            savedMultipleCropRecommendation.firstCropSaveData,
            savedMultipleCropRecommendation.secondCropSaveData,
            transactionalManager,
            nutrientRecommendationsData,
            userId
          );
      } else {
        const cropNutrientsValue = {};
        nutrientRecommendationsData.recommendations.forEach(
          (recommendation) => {
            cropNutrientsValue[NutrientsMapper[recommendation.nutrientId]] =
              recommendation.cropNeedValue;
          }
        );
        // const existingRecommendation = await this.repository.findOne({
        //   where: { ManagementPeriodID: ManagementPeriods[0].ID },
        // });
        const existingRecommendation = allRecommendations.find(
          (mp) => mp.ManagementPeriodID === secondCropManagementData.ID
        );

         let savedData= await this.saveRecommendationsForMultipleCrops(
           transactionalManager,
           nutrientRecommendationsData,
           userId,
           crop,
           dataMultipleCrops,
           latestSoilAnalysis,
           snsAnalysesData,
           allRecommendations
         );
      
      savedRecommendation = savedData.firstCropSaveData
        // if (existingRecommendation) {
        //   // Update the existing recommendation
        //   existingRecommendation.CropN = cropNutrientsValue.N;
        //   existingRecommendation.CropP2O5 = cropNutrientsValue.P2O5;
        //   existingRecommendation.CropK2O = cropNutrientsValue.K2O;
        //   existingRecommendation.CropMgO = cropNutrientsValue.MgO;
        //   existingRecommendation.CropSO3 = cropNutrientsValue.SO3;
        //   existingRecommendation.CropNa2O = cropNutrientsValue.Na2O;
        //   existingRecommendation.CropLime = cropNutrientsValue.CropLime;
        //   existingRecommendation.FertilizerN = cropNutrientsValue.N;
        //   existingRecommendation.FertilizerP2O5 = cropNutrientsValue.P2O5;
        //   existingRecommendation.FertilizerK2O = cropNutrientsValue.K2O;
        //   existingRecommendation.FertilizerMgO = cropNutrientsValue.MgO;
        //   existingRecommendation.FertilizerSO3 = cropNutrientsValue.SO3;
        //   existingRecommendation.FertilizerNa2O = cropNutrientsValue.Na2O;
        //   existingRecommendation.FertilizerLime =
        //     cropNutrientsValue.FertilizerLime;
        //   existingRecommendation.PH = latestSoilAnalysis?.PH?.toString();
        //   existingRecommendation.SNSIndex =
        //     latestSoilAnalysis?.SoilNitrogenSupplyIndex?.toString();
        //   existingRecommendation.PIndex =
        //     latestSoilAnalysis?.PhosphorusIndex?.toString();
        //   existingRecommendation.KIndex =
        //     latestSoilAnalysis?.PotassiumIndex?.toString();
        //   existingRecommendation.MgIndex =
        //     latestSoilAnalysis?.MagnesiumIndex?.toString();
        //   existingRecommendation.Comments = `Reference Value: ${nutrientRecommendationsData.referenceValue}\nVersion: ${nutrientRecommendationsData.versionNumber}`;
        //   existingRecommendation.ModifiedOn = new Date(); // Assuming you update this field on modification
        //   existingRecommendation.ModifiedByID = userId; // Assuming you have the modifier's ID

        //   // Save the updated record
        //   savedRecommendation = await transactionalManager.save(
        //     RecommendationEntity,
        //     existingRecommendation
        //   );
        //   console.log("savedRecommendationnnn", savedRecommendation);
        // } else {
        //   // Create a new recommendation
        //   savedRecommendation = await transactionalManager.save(
        //     RecommendationEntity,
        //     this.RecommendationRepository.create({
        //       CropN: cropNutrientsValue.N,
        //       CropP2O5: cropNutrientsValue.P2O5,
        //       CropK2O: cropNutrientsValue.K2O,
        //       CropMgO: cropNutrientsValue.MgO,
        //       CropSO3: cropNutrientsValue.SO3,
        //       CropNa2O: cropNutrientsValue.Na2O,
        //       CropLime: cropNutrientsValue.CropLime,
        //       FertilizerN: cropNutrientsValue.N,
        //       FertilizerP2O5: cropNutrientsValue.P2O5,
        //       FertilizerK2O: cropNutrientsValue.K2O,
        //       FertilizerMgO: cropNutrientsValue.MgO,
        //       FertilizerSO3: cropNutrientsValue.SO3,
        //       FertilizerNa2O: cropNutrientsValue.Na2O,
        //       FertilizerLime: cropNutrientsValue.FertilizerLime,
        //       PH: latestSoilAnalysis?.PH?.toString(),
        //       SNSIndex: latestSoilAnalysis?.SoilNitrogenSupplyIndex?.toString(),
        //       PIndex: latestSoilAnalysis?.PhosphorusIndex?.toString(),
        //       KIndex: latestSoilAnalysis?.PotassiumIndex?.toString(),
        //       MgIndex: latestSoilAnalysis?.MagnesiumIndex?.toString(),
        //       ManagementPeriodID: secondCropManagementData.ID,
        //       Comments: `Reference Value: ${nutrientRecommendationsData.referenceValue}\nVersion: ${nutrientRecommendationsData.versionNumber}`,
        //       CreatedOn: new Date(),
        //       CreatedByID: userId,
        //     })
        //   );
        // }

        const RecommendationComments = [];
        const notesByNutrient =
          nutrientRecommendationsData?.adviceNotes?.reduce(
            (acc, adviceNote) => {
              if (!acc[adviceNote?.nutrientId]) {
                acc[adviceNote?.nutrientId] = [];
              }
              acc[adviceNote?.nutrientId].push(adviceNote?.note); // Group notes by nutrientId
              return acc;
            },
            {}
          );
        for (const nutrientId in notesByNutrient) {
          const concatenatedNote = notesByNutrient[nutrientId]?.join(" "); // Concatenate notes for the same nutrientId

          // Create a new recommendation comment with the concatenated notes
          const newComment = this.recommendationCommentRepository?.create({
            Nutrient: parseInt(nutrientId),
            Comment: concatenatedNote, // Store concatenated notes
            RecommendationID: savedRecommendation?.ID,
            CreatedOn: new Date(),
            CreatedByID: userId,
          });

          const savedRecommendationComment = await transactionalManager?.save(
            RecommendationCommentEntity,
            newComment
          );
          RecommendationComments.push(savedRecommendationComment);
        }
        Recommendations.push({
          Recommendation: savedRecommendation,
          RecommendationComments,
        });
      }
    }
  }

  async getRecommendationByManagementPeriodID(managementPeriodID) {
    return await this.RecommendationRepository.findOne({
      where: { ManagementPeriodID: managementPeriodID },
    });
  }
  async getFertiliserData(ID) {
    return await this.fertiliserRepository.findOne({
      where: { ManagementPeriodID: ID },
    });
  }

  async UpdatePKBalance(
    fieldId,
    crop,
    nutrientRecommendationsData,
    pkBalanceData,
    userId,
    secondCropManagementData,
    fertiliserData,
    year
  ) {
    console.log("pkBalanceData123", pkBalanceData);

    try {
      let pBalance = 0;
      let kBalance = 0;
      let saveAndUpdatePKBalance;
      console.log("crop.cropInfo1Idjhhhj", crop.CropInfo1);
      console.log("crop.CropTypeIDsshhhs", crop.CropTypeID);
      if (crop.CropTypeID == 170 || crop.CropInfo1 === null) {
        console.log("Othererrorrrr");
        pBalance =
          fertiliserData == null
            ? 0
            : fertiliserData.P2O5 - (0 - pkBalanceData.PBalance);
        kBalance =
          fertiliserData == null
            ? 0
            : fertiliserData.K2O - (0 - pkBalanceData.KBalance);
      } else {
        console.log("NotOthererrorrrr");
        console.log("fertiliserData", fertiliserData);
        for (const recommendation of nutrientRecommendationsData.calculations) {
          console.log(
            "nutrientRecommendationsData.calculations",
            nutrientRecommendationsData.calculations
          );
          switch (recommendation.nutrientId) {
            case 1:
              pBalance =
                fertiliserData == null
                  ? 0
                  : fertiliserData.P2O5 - recommendation.cropNeed;
              console.log("pBalance", pBalance);
              console.log("recommendation.cropNeedP", recommendation.cropNeed);
              break;
            case 2:
              kBalance =
                fertiliserData == null
                  ? 0
                  : fertiliserData.K2O - recommendation.cropNeed;
              console.log("recommendation.cropNeedK", recommendation.cropNeed);
              break;
          }
        }
      }
      if (pkBalanceData) {
        const updateData = {
          Year: year,
          FieldID: fieldId,
          PBalance: pBalance,
          KBalance: kBalance,
        };
        saveAndUpdatePKBalance = {
          ...pkBalanceData,
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
  async saveRecommendationForMutipleCrops(
    transactionalManager,
    nutrientRecommendationsData,
    savedCrop,
    firstCropData,
    managementPeriodData,
    secondCropManagementData,
    latestSoilAnalysis,
    snsAnalysesData,
    userId
  ) {
    // Initialize variables for recommendations for both Crop Orders
    let cropOrder1Data = {
      CropN: 0,
      ManureN: 0,
      FertilizerN: 0,
      CropP2O5: 0,
      ManureP2O5: 0,
      FertilizerP2O5: 0,
      CropK2O: 0,
      ManureK2O: 0,
      FertilizerK2O: 0,
      CropMgO: 0,
      ManureMgO: 0,
      FertilizerMgO: 0,
      CropSO3: 0,
      ManureSO3: 0,
      FertilizerSO3: 0,
      CropNa2O: 0,
      ManureNa2O: 0,
      FertilizerNa2O: 0,
      CropLime: 0,
      ManureLime: 0,
      FertilizerLime: 0,
      PH: latestSoilAnalysis?.PH?.toString(),
      SNSIndex: latestSoilAnalysis?.SoilNitrogenSupplyIndex?.toString(),
      PIndex: latestSoilAnalysis?.PhosphorusIndex?.toString(),
      KIndex: latestSoilAnalysis?.PotassiumIndex?.toString(),
      MgIndex: latestSoilAnalysis?.MagnesiumIndex?.toString(),
      SIndex: snsAnalysesData?.SoilNitrogenSupplyIndex?.toString(),
    };

    let cropOrder2Data = {
      CropN: 0,
      ManureN: 0,
      FertilizerN: 0,
      CropP2O5: 0,
      ManureP2O5: 0,
      FertilizerP2O5: 0,
      CropK2O: 0,
      ManureK2O: 0,
      FertilizerK2O: 0,
      CropMgO: 0,
      ManureMgO: 0,
      FertilizerMgO: 0,
      CropSO3: 0,
      ManureSO3: 0,
      FertilizerSO3: 0,
      CropNa2O: 0,
      ManureNa2O: 0,
      FertilizerNa2O: 0,
      CropLime: 0,
      ManureLime: 0,
      FertilizerLime: 0,
      PH: latestSoilAnalysis?.PH?.toString(),
      SNSIndex: latestSoilAnalysis?.SoilNitrogenSupplyIndex?.toString(),
      PIndex: latestSoilAnalysis?.PhosphorusIndex?.toString(),
      KIndex: latestSoilAnalysis?.PotassiumIndex?.toString(),
      MgIndex: latestSoilAnalysis?.MagnesiumIndex?.toString(),
      SIndex: snsAnalysesData?.SoilNitrogenSupplyIndex?.toString(),
    };

    // Iterate through the nutrient recommendations data
    nutrientRecommendationsData.calculations.forEach((calculation) => {
      const nutrientId = calculation.nutrientId;
      const sequenceId = calculation.sequenceId;
      console.log("calculation.cropNeed", calculation);
      switch (nutrientId) {
        case 0:
          // Nitrogen (N) handling
          if (sequenceId === 1) {
            cropOrder1Data.CropN = calculation.recommendation;
            cropOrder1Data.ManureN = calculation.applied;
            cropOrder1Data.FertilizerN = calculation.cropNeed;
          } else if (sequenceId === 2) {
            cropOrder2Data.CropN = calculation.recommendation;
            cropOrder2Data.ManureN = calculation.applied;
            cropOrder2Data.FertilizerN = calculation.cropNeed;
          }
          break;
        case 1:
          // Phosphorus (P2O5) handling
          if (sequenceId === 1) {
            cropOrder1Data.CropP2O5 = calculation.recommendation;
            cropOrder1Data.ManureP2O5 = calculation.applied;
            cropOrder1Data.FertilizerP2O5 = calculation.cropNeed;
          } else if (sequenceId === 2) {
            cropOrder2Data.CropP2O5 = calculation.recommendation;
            cropOrder2Data.ManureP2O5 = calculation.applied;
            cropOrder2Data.FertilizerP2O5 = calculation.cropNeed;
          }
          break;
        case 2:
          // Potassium (K2O) handling
          if (sequenceId === 1) {
            cropOrder1Data.CropK2O = calculation.recommendation;
            cropOrder1Data.ManureK2O = calculation.applied;
            cropOrder1Data.FertilizerK2O = calculation.cropNeed;
          } else if (sequenceId === 2) {
            cropOrder2Data.CropK2O = calculation.recommendation;
            cropOrder2Data.ManureK2O = calculation.applied;
            cropOrder2Data.FertilizerK2O = calculation.cropNeed;
          }
          break;
        case 3:
          // Magnesium (MgO) handling
          if (sequenceId === 1) {
            cropOrder1Data.CropMgO = calculation.recommendation;
            cropOrder1Data.ManureMgO = calculation.applied;
            cropOrder1Data.FertilizerMgO = calculation.cropNeed;
          } else if (sequenceId === 2) {
            cropOrder2Data.CropMgO = calculation.recommendation;
            cropOrder2Data.ManureMgO = calculation.applied;
            cropOrder2Data.FertilizerMgO = calculation.cropNeed;
          }
          break;
        case 4:
          // Sulfur (SO3) handling
          if (sequenceId === 1) {
            cropOrder1Data.CropSO3 = calculation.recommendation;
            cropOrder1Data.ManureSO3 = calculation.applied;
            cropOrder1Data.FertilizerSO3 = calculation.cropNeed;
          } else if (sequenceId === 2) {
            cropOrder2Data.CropSO3 = calculation.recommendation;
            cropOrder2Data.ManureSO3 = calculation.applied;
            cropOrder2Data.FertilizerSO3 = calculation.cropNeed;
          }
          break;
        case 5:
          // Sodium (Na2O) handling
          if (sequenceId === 1) {
            cropOrder1Data.CropNa2O = calculation.recommendation;
            cropOrder1Data.ManureNa2O = calculation.applied;
            cropOrder1Data.FertilizerNa2O = calculation.cropNeed;
          } else if (sequenceId === 2) {
            cropOrder2Data.CropNa2O = calculation.recommendation;
            cropOrder2Data.ManureNa2O = calculation.applied;
            cropOrder2Data.FertilizerNa2O = calculation.cropNeed;
          }
          break;
        case 6:
          // Lime handling
          if (sequenceId === 1) {
            cropOrder1Data.CropLime = calculation.recommendation;
            cropOrder1Data.ManureLime = calculation.applied;
            cropOrder1Data.FertilizerLime = calculation.cropNeed;
          } else if (sequenceId === 2) {
            cropOrder2Data.CropLime = calculation.recommendation;
            cropOrder2Data.ManureLime = calculation.applied;
            cropOrder2Data.FertilizerLime = calculation.cropNeed;
          }
          break;
        default:
          break;
      }
    });

    // Save or update for Crop Order 1
    let firstCropSaveData = await this.getRecommendationByManagementPeriodID(
      managementPeriodData.ID
    );

    if (firstCropSaveData) {
      // Update existing recommendation
      firstCropSaveData = {
        ...firstCropSaveData,
        ...cropOrder1Data,
        ModifiedByID: userId,
        ModifiedOn: new Date(),
        Comments: `Reference Value: ${nutrientRecommendationsData.referenceValue}\nVersion: ${nutrientRecommendationsData.versionNumber}`,
      };
      await transactionalManager.save(RecommendationEntity, firstCropSaveData);
    }
console.log('aaaaaaaa')
    // Save or update for Crop Order 2
    let secondCropSaveData = await this.getRecommendationByManagementPeriodID(
      secondCropManagementData.ID
    );

    if (secondCropSaveData) {
      // Update existing recommendation
      secondCropSaveData = {
        ...secondCropSaveData,
        ...cropOrder2Data,
        Comments: `Reference Value: ${nutrientRecommendationsData.referenceValue}\nVersion: ${nutrientRecommendationsData.versionNumber}`,
      };
      await transactionalManager.save(RecommendationEntity, secondCropSaveData);
    }

    return {
      firstCropSaveData,
      secondCropSaveData,
    };
  }
  async saveMultipleRecommendation(
    Recommendations,
    firstCropSaveData, // First crop data
    secondCropSaveData, // Second crop data
    transactionalManager,
    nutrientRecommendationsData,
    userId
  ) {
    const RecommendationComments = [];

    // Separate advice notes by sequenceId for first crop (sequenceId = 1) and second crop (sequenceId = 2)
    const firstCropNotes = nutrientRecommendationsData.adviceNotes?.filter(
      (note) => note.sequenceId === 1
    );
    const secondCropNotes = nutrientRecommendationsData.adviceNotes?.filter(
      (note) => note.sequenceId === 2
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

    const firstCropNotesByNutrientId = groupNotesByNutrientId(firstCropNotes);
    const secondCropNotesByNutrientId = groupNotesByNutrientId(secondCropNotes);

    // Track nutrient IDs that are being processed
    const nutrientIdsInData = [];

    // Function to handle saving comments (with updates or creations)
    const saveComments = async (notesByNutrientId, savedCrop) => {
      const existingComments = await transactionalManager.find(
        RecommendationCommentEntity,
        { where: { RecommendationID: savedCrop.ID } }
      );

      for (const nutrientId in notesByNutrientId) {
        const concatenatedNote = notesByNutrientId[nutrientId].join(" "); // Concatenate notes for the same nutrientId

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
    };

    // Handle notes for the first crop (sequenceId = 1)
    await saveComments(firstCropNotesByNutrientId, firstCropSaveData);

    // Handle notes for the second crop (sequenceId = 2)
    await saveComments(secondCropNotesByNutrientId, secondCropSaveData);

    // Push the first crop recommendation and its comments to the final result array
    Recommendations.push({
      Recommendation: firstCropSaveData, // First crop recommendation
      RecommendationComments,
    });

    // Push the second crop recommendation and its comments to the final result array
    Recommendations.push({
      Recommendation: secondCropSaveData, // Second crop recommendation
      RecommendationComments,
    });
  }
  async savedDefault(cropData, userId, transactionalManager) {
    const ManagementPeriods = [];
    console.log("kckcknn", cropData);
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

  async getCropPlanOfNextYear(cropYear, fieldId) {
    return await this.cropRepository.find({
      where: {
        FieldID: fieldId,
        Year: MoreThan(cropYear),
      },
      select: { ID: true },
    });
  }

  async getPKBalanceData(cropYear, fieldId) {
    return await this.pkBalanceRepository.findOne({
      where: { Year: cropYear, FieldID: fieldId },
    });
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
    OrganicManure,
    mannerOutputs,
    userId,
    latestSoilAnalysis,
    snsAnalysesData,
    allRecommendations
  ) {
    // Prepare cropOrderData with the values from latestSoilAnalysis, snsAnalysesData, and mannerOutputReq
    let cropOrderData = {
      CropN: null,
      ManureN: mannerOutputs.data.currentCropAvailableN,
      FertilizerN: null,
      CropP2O5: null,
      ManureP2O5: mannerOutputs.data.cropAvailableP2O5 || null,
      FertilizerP2O5: null,
      ManureK2O: mannerOutputs.data.cropAvailableK2O || null,
      CropMgO: null,
      ManureMgO: null,
      FertilizerMgO: null,
      CropSO3: null,
      ManureSO3: null,
      FertilizerSO3: null,
      CropNa2O: null, // assuming Na2O is present in mannerOutputReq if not remove this
      ManureNa2O: null,
      FertilizerNa2O: null, // assuming Na2O is present
      CropLime: null,
      ManureLime: null,
      FertilizerLime: null, // Assuming no data for FertilizerLime
      PH: latestSoilAnalysis?.PH?.toString() || null,
      SNSIndex: latestSoilAnalysis?.SoilNitrogenSupplyIndex?.toString() || null,
      PIndex: latestSoilAnalysis?.PhosphorusIndex?.toString() || null,
      KIndex: latestSoilAnalysis?.PotassiumIndex?.toString() || null,
      MgIndex: latestSoilAnalysis?.MagnesiumIndex?.toString() || null,
      SIndex: snsAnalysesData?.SoilNitrogenSupplyIndex?.toString() || null,
    };

    // Check if there's an existing recommendation for the current OrganicManure.ManagementPeriodID
    let recommendation = allRecommendations.find(
      (rec) => rec.ManagementPeriodID === OrganicManure.ManagementPeriodID
    );

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
    // else {
    //   // If no recommendation exists, create a new one
    //   recommendation = this.RecommendationRepository.create({
    //     ...cropOrderData,
    //     ManagementPeriodID: OrganicManure.ManagementPeriodID,
    //     Comments: "New recommendation created",
    //     CreatedOn: new Date(),
    //     CreatedByID: userId,
    //   });
    //   await transactionalManager.save(RecommendationEntity, recommendation);
    // }

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
    const firstCropNotes = arableNotes.filter((note) => note.sequenceId === 1);
    const secondCropNotes = arableNotes.filter((note) => note.sequenceId === 2);

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
        const concatenatedNote = notesByNutrientId[nutrientId].join(" ");

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
  async saveRecommendationsForMultipleCrops(
    transactionalManager,
    nutrientRecommendationsData,
    userId,
    cropData,
    dataMultipleCrops,
    latestSoilAnalysis,
    snsAnalysesData,
    allRecommendations
  ) {
    let cropOrder1Data = {
      CropN: 0,
      ManureN: 0,
      FertilizerN: 0,
      CropP2O5: 0,
      ManureP2O5: 0,
      FertilizerP2O5: 0,
      CropK2O: 0,
      ManureK2O: 0,
      FertilizerK2O: 0,
      CropMgO: 0,
      ManureMgO: 0,
      FertilizerMgO: 0,
      CropSO3: 0,
      ManureSO3: 0,
      FertilizerSO3: 0,
      CropNa2O: 0,
      ManureNa2O: 0,
      FertilizerNa2O: 0,
      CropLime: 0,
      ManureLime: 0,
      FertilizerLime: 0,
      PH: latestSoilAnalysis?.PH?.toString(),
      SNSIndex: latestSoilAnalysis?.SoilNitrogenSupplyIndex?.toString(),
      PIndex: latestSoilAnalysis?.PhosphorusIndex?.toString(),
      KIndex: latestSoilAnalysis?.PotassiumIndex?.toString(),
      MgIndex: latestSoilAnalysis?.MagnesiumIndex?.toString(),
      SIndex: snsAnalysesData?.SoilNitrogenSupplyIndex?.toString(),
    };

    let cropOrder2Data = {
      ...cropOrder1Data,
    };

    const firstCrop = dataMultipleCrops?.find((crop) => crop.CropOrder === 1);
    const secondCrop = dataMultipleCrops?.find((crop) => crop.CropOrder === 2);

    const recommendationMap = allRecommendations.reduce(
      (acc, recommendation) => {
        acc[recommendation.ManagementPeriodID] = recommendation;
        return acc;
      },
      {}
    );

    // Get ManagementPeriodID for first crop
    let firstCropSaveData = null;
    if (firstCrop) {
      const firstCropManagementPeriodId =
        await this.managementPeriodRepository.findOneBy({
          CropID: firstCrop.ID,
        });

      nutrientRecommendationsData?.calculations?.forEach((calculation) => {
        if (calculation.sequenceId === 1) {
          switch (calculation.nutrientId) {
            case 0:
              cropOrder1Data.CropN = calculation.recommendation;
              cropOrder1Data.ManureN = calculation.applied;
              cropOrder1Data.FertilizerN = calculation.cropNeed;
              break;
            case 1:
              cropOrder1Data.CropP2O5 = calculation.recommendation;
              cropOrder1Data.ManureP2O5 = calculation.applied;
              cropOrder1Data.FertilizerP2O5 = calculation.cropNeed;
              break;
            case 2:
              cropOrder1Data.CropK2O = calculation.recommendation;
              cropOrder1Data.ManureK2O = calculation.applied;
              cropOrder1Data.FertilizerK2O = calculation.cropNeed;
              break;
            case 3:
              cropOrder1Data.CropMgO = calculation.recommendation;
              cropOrder1Data.ManureMgO = calculation.applied;
              cropOrder1Data.FertilizerMgO = calculation.cropNeed;
              break;
            case 4:
              cropOrder1Data.CropSO3 = calculation.recommendation;
              cropOrder1Data.ManureSO3 = calculation.applied;
              cropOrder1Data.FertilizerSO3 = calculation.cropNeed;
              break;
            case 5:
              cropOrder1Data.CropNa2O = calculation.recommendation;
              cropOrder1Data.ManureNa2O = calculation.applied;
              cropOrder1Data.FertilizerNa2O = calculation.cropNeed;
              break;
            case 6:
              cropOrder1Data.CropLime = calculation.recommendation;
              cropOrder1Data.ManureLime = calculation.applied;
              cropOrder1Data.FertilizerLime = calculation.cropNeed;
              break;
          }
        }
      });

      firstCropSaveData = recommendationMap[firstCropManagementPeriodId.ID];

      if (firstCropSaveData) {
        firstCropSaveData = {
          ...firstCropSaveData,
          ...cropOrder1Data,
          ModifiedOn: new Date(),
          ModifiedByID: userId,
        };
        await transactionalManager.save(
          RecommendationEntity,
          firstCropSaveData
        );
      } else {
        firstCropSaveData = this.RecommendationRepository.create({
          ...cropOrder1Data,
          ManagementPeriodID: firstCropManagementPeriodId.ID,
          Comments:
            "Reference Value: " +
            nutrientRecommendationsData.referenceValue +
            "\nVersion: " +
            nutrientRecommendationsData.version,
          CreatedOn: new Date(),
          CreatedByID: userId,
        });
        await transactionalManager.save(
          RecommendationEntity,
          firstCropSaveData
        );
      }
    }

    // Get ManagementPeriodID for second crop if it exists
    let secondCropSaveData = null;
    if (secondCrop) {
      const secondCropManagementPeriodId =
        await this.managementPeriodRepository.findOneBy({
          CropID: secondCrop.ID,
        });

      nutrientRecommendationsData?.calculations?.forEach((calculation) => {
        if (calculation.sequenceId === 2) {
          switch (calculation.nutrientId) {
            case 0:
              cropOrder2Data.CropN = calculation.recommendation;
              cropOrder2Data.ManureN = calculation.applied;
              cropOrder2Data.FertilizerN = calculation.cropNeed;
              break;
            case 1:
              cropOrder2Data.CropP2O5 = calculation.recommendation;
              cropOrder2Data.ManureP2O5 = calculation.applied;
              cropOrder2Data.FertilizerP2O5 = calculation.cropNeed;
              break;
            case 2:
              cropOrder2Data.CropK2O = calculation.recommendation;
              cropOrder2Data.ManureK2O = calculation.applied;
              cropOrder2Data.FertilizerK2O = calculation.cropNeed;
              break;
            case 3:
              cropOrder2Data.CropMgO = calculation.recommendation;
              cropOrder2Data.ManureMgO = calculation.applied;
              cropOrder2Data.FertilizerMgO = calculation.cropNeed;
              break;
            case 4:
              cropOrder2Data.CropSO3 = calculation.recommendation;
              cropOrder2Data.ManureSO3 = calculation.applied;
              cropOrder2Data.FertilizerSO3 = calculation.cropNeed;
              break;
            case 5:
              cropOrder2Data.CropNa2O = calculation.recommendation;
              cropOrder2Data.ManureNa2O = calculation.applied;
              cropOrder2Data.FertilizerNa2O = calculation.cropNeed;
              break;
            case 6:
              cropOrder2Data.CropLime = calculation.recommendation;
              cropOrder2Data.ManureLime = calculation.applied;
              cropOrder2Data.FertilizerLime = calculation.cropNeed;
              break;
          }
        }
      });

      secondCropSaveData = recommendationMap[secondCropManagementPeriodId.ID];

      if (secondCropSaveData) {
        secondCropSaveData = {
          ...secondCropSaveData,
          ...cropOrder2Data,
          ModifiedOn: new Date(),
          ModifiedByID: userId,
        };
        await transactionalManager.save(
          RecommendationEntity,
          secondCropSaveData
        );
      } else {
        secondCropSaveData = this.RecommendationRepository.create({
          ...cropOrder2Data,
          ManagementPeriodID: secondCropManagementPeriodId.ID,
          Comments:
            "Reference Value: " +
            nutrientRecommendationsData.referenceValue +
            "\nVersion: " +
            nutrientRecommendationsData.version,
          CreatedOn: new Date(),
          CreatedByID: userId,
        });
        await transactionalManager.save(
          RecommendationEntity,
          secondCropSaveData
        );
      }
    }

    // Return the saved data for one or both crops based on the input
    if (secondCrop) {
      return { firstCropSaveData, secondCropSaveData };
    } else {
      return { firstCropSaveData };
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
    field
  ) {
    const arableBody = [];

    // Ensure dataMultipleCrops is always treated as an array
    const crops = Array.isArray(dataMultipleCrops)
      ? dataMultipleCrops
      : [dataMultipleCrops];

    // Fetch cropTypes list once for all crops
    const cropTypesList = await this.rB209ArableService.getData(
      "/Arable/CropTypes"
    );

    // Iterate over crops (single or multiple)
    for (const crop of crops) {
      const currentCropType = cropTypesList.find(
        (cropType) => cropType.cropTypeId === crop.CropTypeID
      );

      if (!currentCropType || currentCropType.cropGroupId == null) {
        throw new HttpException(
          `Invalid CropTypeId for crop having field name ${field.Name}`,
          HttpStatus.BAD_REQUEST
        );
      }

      // Add crop to arableBody based on its CropOrder
      arableBody.push({
        cropOrder: crop.CropOrder,
        cropGroupId: currentCropType.cropGroupId,
        cropTypeId: crop.CropTypeID,
        cropInfo1Id: crop.CropInfo1,
        cropInfo2Id: crop.CropInfo2,
        sowingDate: crop.SowingDate,
        expectedYield: crop.Yield,
      });
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
    organicManureData
  ) {
    const cropTypesList = await this.rB209ArableService.getData(
      "/Arable/CropTypes"
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
      throw new HttpException(
        `Invalid CropTypeId for crop having field name ${field.Name}`,
        HttpStatus.BAD_REQUEST
      );
    }
    const previousCrop = await this.cropRepository.find({
      where: {
        FieldID: field.ID,
        Year: crop.Year - 1,
        Confirm: true,
      },
      take: 1,
    })[0];
    console.log("dataMultipleCropsss", dataMultipleCrops);
    const arableBody = await this.buildArableBody(dataMultipleCrops, field);
    console.log("arablefffBody", arableBody);
    const nutrientRecommendationnReqBody = {
      field: {
        fieldType: crop.FieldType,
        multipleCrops: arableBody.length > 1 ? true : false,
        arable: arableBody,
        grassland:
          crop.FieldType == 1
            ? {}
            : {
                cropOrder: null,
                snsId: null,
                grassGrowthClassId: null,
                yieldTypeId: null,
                sequenceId: null,
                grasslandSequence: [
                  {
                    position: null,
                    cropMaterialId: null,
                    yield: null,
                  },
                ],
                establishedDate: null,
                seasonId: null,
                siteClassId: null,
              },
        soil: {
          soilTypeId: field.SoilTypeID,
          kReleasingClay: field.SoilReleasingClay,
          nvzActionProgrammeId: field.NVZProgrammeID,
          psc: 0, //TODO:: need to find it
          soilAnalyses: [],
        },
        harvestYear: crop.Year,
        area: farm.TotalFarmArea,
        postcode: farm.Postcode,
        altitude: farm.AverageAltitude,
        rainfallAverage: farm.Rainfall,
        excessWinterRainfall: 0, //TODO:: need to find it
        mannerManures: true,
        organicMaterials: [],
        mannerOutputs: [
          {
            id: crop.CropOrder,
            totalN: mannerOutputs.data.totalN,
            availableN: mannerOutputs.data.currentCropAvailableN,
            totalP: mannerOutputs.data.totalP2O5,
            availableP: mannerOutputs.data.cropAvailableP2O5,
            totalK: mannerOutputs.data.totalK2O,
            availableK: mannerOutputs.data.cropAvailableK2O,
            totalS: mannerOutputs.data.totalSO3,
            availableS: 0, //TODO:: need to find it
            totalM: mannerOutputs.data.totalMgO,
          },
        ],
        previousCropping: {},
        countryId: farm.EnglishRules ? 1 : 2,
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
    if (soilAnalysis) {
      soilAnalysis?.forEach((soilAnalysis) => {
        nutrientRecommendationnReqBody.field.soil.soilAnalyses.push({
          soilAnalysisDate: soilAnalysis.Date,
          soilpH: soilAnalysis.PH,
          sulphurDeficient: soilAnalysis.SulphurDeficient,
          snsIndexId: soilAnalysis.SoilNitrogenSupplyIndex,
          pIndexId: soilAnalysis.PhosphorusIndex,
          kIndexId: soilAnalysis.PotassiumIndex,
          mgIndexId: soilAnalysis.MagnesiumIndex,
          snsMethodologyId: 4,
          pMethodologyId: 0,
          kMethodologyId: 4,
          mgMethodologyId: 4,
        });
      });
    }
    // Add SnsAnalyses data
    if (snsAnalysesData) {
      nutrientRecommendationnReqBody.field.soil.soilAnalyses.push({
        soilAnalysisDate: snsAnalysesData.SampleDate, // Using snsAnalysesData.SampleDate
        snsIndexId: snsAnalysesData.SoilNitrogenSupplyIndex, // Using snsAnalysesData.SoilNitrogenSupplyIndex
        snsMethodologyId: 4,
        pMethodologyId: 0,
        kMethodologyId: 4,
        mgMethodologyId: 4,
      });
    }

    if (previousCrop) {
      const cropType = cropTypesList.find(
        (cropType) => cropType.cropTypeId === previousCrop.CropTypeID
      );
      nutrientRecommendationnReqBody.field.previousCropping = {
        previousCropGroupId: cropType.cropGroupId,
        previousCropTypeId: previousCrop.CropTypeID,
      };
    }
    nutrientRecommendationnReqBody.referenceValue = `${field.ID}-${crop.ID}-${crop.Year}`;

    return nutrientRecommendationnReqBody;
  }

  async buildNutrientWithoutMannerRecommendationReqBody(
    field,
    farm,
    soilAnalysis,
    snsAnalysesData,
    dataMultipleCrops,
    crop,
    pkBalanceData
  ) {
    const cropTypesList = await this.rB209ArableService.getData(
      "/Arable/CropTypes"
    );
    const cropType = cropTypesList.find(
      (cropType) => cropType.cropTypeId === crop.CropTypeID
    );

    if (!cropType || cropType.cropGroupId === null) {
      throw boom.HttpException(
        `Invalid CropTypeId for crop having field name ${field.Name}`,
        HttpStatus.BAD_REQUEST
      );
    }
    const previousCrop = await this.cropRepository.find({
      where: {
        FieldID: field.ID,
        Year: crop.Year - 1,
        Confirm: true,
      },
      take: 1,
    })[0];
    // Use the buildArableBody function to get the arable array
    const arableBody = await this.buildArableBody(dataMultipleCrops, field);
    const nutrientRecommendationnReqBody = {
      field: {
        fieldType: crop.FieldType,
        multipleCrops: arableBody.length > 1 ? true : false,
        arable: arableBody,
        grassland:
          crop.FieldType == 1
            ? {}
            : {
                cropOrder: null,
                snsId: null,
                grassGrowthClassId: null,
                yieldTypeId: null,
                sequenceId: null,
                grasslandSequence: [
                  {
                    position: null,
                    cropMaterialId: null,
                    yield: null,
                  },
                ],
                establishedDate: null,
                seasonId: null,
                siteClassId: null,
              },
        soil: {
          soilTypeId: field.SoilTypeID,
          kReleasingClay: field.SoilReleasingClay,
          nvzActionProgrammeId: field.NVZProgrammeID,
          psc: 0, //TODO:: need to find it
          pkBalance: {
            phosphate: pkBalanceData != null ? pkBalanceData.PBalance : 0,
            potash: pkBalanceData != null ? pkBalanceData.KBalance : 0,
          },
          soilAnalyses: [],
        },
        harvestYear: crop.Year,
        area: farm.TotalFarmArea,
        postcode: farm.Postcode,
        altitude: farm.AverageAltitude,
        rainfallAverage: farm.Rainfall,
        excessWinterRainfall: 0, //TODO:: need to find it
        organicMaterials: [],
        previousCropping: {},
        countryId: farm.EnglishRules ? 1 : 2,
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
    if (soilAnalysis) {
      soilAnalysis?.forEach((soilAnalysis) => {
        nutrientRecommendationnReqBody.field.soil.soilAnalyses.push({
          soilAnalysisDate: soilAnalysis.Date,
          soilpH: soilAnalysis.PH,
          sulphurDeficient: soilAnalysis.SulphurDeficient,
          snsIndexId: soilAnalysis.SoilNitrogenSupplyIndex,
          pIndexId: soilAnalysis.PhosphorusIndex,
          kIndexId: soilAnalysis.PotassiumIndex,
          mgIndexId: soilAnalysis.MagnesiumIndex,
          snsMethodologyId: 4,
          pMethodologyId: 0,
          kMethodologyId: 4,
          mgMethodologyId: 4,
        });
      });
    }

    // Add SnsAnalyses data
    if (snsAnalysesData) {
      nutrientRecommendationnReqBody.field.soil.soilAnalyses.push({
        soilAnalysisDate: snsAnalysesData.SampleDate, // Using snsAnalysesData.SampleDate
        snsIndexId: snsAnalysesData.SoilNitrogenSupplyIndex, // Using snsAnalysesData.SoilNitrogenSupplyIndex
        snsMethodologyId: 4,
        pMethodologyId: 0,
        kMethodologyId: 4,
        mgMethodologyId: 4,
      });
    }

    if (previousCrop) {
      const cropType = cropTypesList.find(
        (cropType) => cropType.cropTypeId === previousCrop.CropTypeID
      );
      nutrientRecommendationnReqBody.field.previousCropping = {
        previousCropGroupId: cropType.cropGroupId,
        previousCropTypeId: previousCrop.CropTypeID,
      };
    }
    nutrientRecommendationnReqBody.referenceValue = `${field.ID}-${crop.ID}-${crop.Year}`;

    return nutrientRecommendationnReqBody;
  }
  async getSnsAnalysesData(id) {
    const data = await this.snsAnalysisRepository.findOne({
      where: { FieldID: id }, // This line is correct as per your entity definition
    });

    return data;
  }

  async getAllOrganicManure() {
    return this.organicManureRepository.find();
  }

  async getCrops(fieldID, year) {
    return this.cropRepository.find({
      where: { FieldID: fieldID, Year: year },
    });
  }

  async handleSoilAnalysisValidation(fieldId, fieldName, year) {
    const errors = [];
    const fiveYearsAgo = year - 4;

    // Fetch all soil analyses for the last 5 years
    const soilAnalysisRecords = await this.soilAnalysisRepository.find({
      where: {
        FieldID: fieldId,
        Year: Between(fiveYearsAgo, year), // Fetch records within 5 years
      },
      order: { Date: "DESC" }, // Order by date, most recent first
    });

    const soilRequiredKeys = [
      "Date",
      "PH",
      "SulphurDeficient",
      "SoilNitrogenSupplyIndex",
      "PhosphorusIndex",
      "PotassiumIndex",
      "MagnesiumIndex",
    ];

    // Validate the most recent soil analysis (first record in the sorted array)
    const latestSoilAnalysis = soilAnalysisRecords[0];

    return { latestSoilAnalysis, errors, soilAnalysisRecords };
  }

  async getManagementPeriods(cropIds) {
    return this.managementPeriodRepository.find({
      where: { CropID: In(cropIds) },
      select: ["ID", "CropID"],
    });
  }

  async getManagementPeriod(id) {
    const data = await this.managementPeriodRepository.findOne({
      where: {
        CropID: id,
      },
    });

    return data;
  }

  async getOrganicManures(managementPeriods) {
    const managementPeriodIDs = managementPeriods.map((mp) => mp.ID);
    return this.organicManureRepository.find({
      where: { ManagementPeriodID: In(managementPeriodIDs) },
    });
  }

  async buildManureApplications(
    managementPeriodID,
    organicManureAllData,
    request
  ) {
    const mulOrganicManuresData = organicManureAllData.filter(
      (manure) => manure.ManagementPeriodID === managementPeriodID
    );
    console.log("mulOrganicManuresData", mulOrganicManuresData);
    const manureTypeData = await this.MannerManureTypesService.getData(
      `/manure-types/${mulOrganicManuresData[0].ManureTypeID}`,
      request
    );

    console.log("manureTypeDataddd", manureTypeData);

    return mulOrganicManuresData.map((manure) => ({
      manureDetails: {
        manureID: manure.ManureTypeID,
        name: manureTypeData.data.Name,
        isLiquid: manureTypeData.data.IsLiquid,
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
      cropNUptake: manure.AutumnCropNitrogenUptake,
      windspeedID: manure.WindspeedID,
      rainTypeID: manure.RainfallWithinSixHoursID,
      topsoilMoistureID: manure.MoistureID,
    }));
  }

  async buildMannerOutputReq(
    fieldID,
    manureApplications,
    request,
    cropData,
    farmData,
    fieldData,
    cropTypeLinkingData
  ) {
    return {
      runType: farmData.EnglishRules ? 3 : 4,
      postcode: farmData.Postcode.split(" ")[0],
      countryID: farmData.EnglishRules ? 1 : 2,
      field: {
        fieldID: fieldData.ID,
        fieldName: fieldData.Name,
        MannerCropTypeID: cropTypeLinkingData.MannerCropTypeID,
        topsoilID: fieldData.TopSoilID,
        subsoilID: fieldData.SubSoilID,
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
module.exports = { UpdateRecommendation };
