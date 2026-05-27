const { CropEntity } = require("../db/entity/crop.entity");
const { ManagementPeriodEntity } = require("../db/entity/management-period.entity");
const { SoilAnalysisEntity } = require("../db/entity/soil-analysis.entity");
const { SnsAnalysesEntity } = require("../db/entity/sns-analysis.entity");
const { RecommendationEntity } = require("../db/entity/recommendation.entity");
const { PKBalanceEntity } = require("../db/entity/pk-balance.entity");
const { PreviousGrassesEntity } = require("../db/entity/previous-grasses-entity");
const { OrganicManureEntity } = require("../db/entity/organic-manure.entity");
const { GrassManagementOptionsEntity } = require("../db/entity/grassManagementOptionsEntity");
const { MoreThan } = require("typeorm");
const { CropTypeMapper } = require("../constants/crop-type-mapper");
const { CountryMapper } = require("../constants/country-mapper");

const fieldRelatedMethods = {
async getFieldRelatedData(fieldIds, year, request) {
  // Fetch all fields by the list of FieldIDs
  const fields = await this.repository.findByIds(fieldIds);
  const cropTypeAllData =
    await this.rB209ArableService.getData(`/Arable/CropTypes`);

  // Fetch the farm associated with the first field (assuming all fields belong to the same farm)
  const farm = await this.FarmService.getFarmById(fields[0].FarmID);

  // Initialize an array to store fields with related data
  const fieldsWithRelatedData = [];

  const {
    allManureData,
    allApplicationMethodsData,
    allIncorporationMethodsData,
    allIncorporationDelaysData,
  } = await this.fetchAllApplicationReferenceData(request);

  await Promise.all(
    fields.map(async (field) => {
      // Fetch crops, previousGrasses, snsAnalysis, soilAnalysis, and pkBalance for the current field
      const crops = await this.cropRepository.find({
        where: { FieldID: field.ID, Year: year },
      });
      let previousCropData = await this.cropRepository.findOne({
        where: { FieldID: field.ID, Year: year - 1 },
        select: ["CropTypeID"],
        order: {
          CreatedOn: "DESC", // Order by createdDate in descending order
        },
      });
      // if no plan in previous year. Fetch from previous crop history
      if (previousCropData == null) {
        previousCropData = await this.previousCroppingRepository.findOne({
          where: { FieldID: field.ID, HarvestYear: year - 1 },
          select: ["CropTypeID"],
        });
      }
      const previousCropTypeName = previousCropData
        ? await this.getCropTypeName(
            previousCropData.CropTypeID,
            cropTypeAllData,
          )
        : null;

      const previousGrasses = await this.getPreviousCropDataByFieldID(
        field.ID,
      );
      let grassManagementOptionName = null;
      if (previousGrasses) {
        const grassManagementOptionID =
          previousGrasses.GrassManagementOptionID == null
            ? null
            : previousGrasses.GrassManagementOptionID;

        if (grassManagementOptionID) {
          const grassManagementOption =
            await this.grassManagementOptionsRepository.findOne({
              where: { ID: grassManagementOptionID },
              select: ["Name"],
            });
          console.log("grassManagementOption", grassManagementOption);
          grassManagementOptionName = grassManagementOption
            ? grassManagementOption.Name
            : null;
        }
      }
      // const snsAnalysis = await this.snsAnalysisRepository.find({
      //   where: { FieldID: field.ID },
      // });
      // Fetch the latest SoilAnalysis entry for the current field
      // const latestSoilAnalysis = await this.soilAnalysisRepository.findOne({
      //   where: { FieldID: field.ID },
      //   order: { ModifiedOn: "DESC" }, // Sort by ModifiedOn descending
      //   take: 1, // Retrieve only the latest entry
      // });

      // If no SoilAnalysis is found, you can handle it accordingly (e.g., set default values)
      // const soilAnalysisAndSNSanalysis =
      //   latestSoilAnalysis || snsAnalysis.length > 0
      //     ? {
      //         PH:
      //           latestSoilAnalysis != null
      //             ? latestSoilAnalysis.PH
      //             : "Not Entered",
      //         PhosphorusIndex:
      //           latestSoilAnalysis != null
      //             ? latestSoilAnalysis.PhosphorusIndex
      //             : "Not Entered",
      //         PotassiumIndex:
      //           latestSoilAnalysis != null
      //             ? latestSoilAnalysis.PotassiumIndex
      //             : "Not Entered",
      //         MagnesiumIndex:
      //           latestSoilAnalysis != null
      //             ? latestSoilAnalysis.MagnesiumIndex
      //             : "Not Entered",
      //         SNS:
      //           snsAnalysis.length > 0
      //             ? snsAnalysis[0].SoilNitrogenSupplyValue
      //             : "Not Entered",
      //         SNSIndex:
      //           snsAnalysis.length > 0
      //             ? snsAnalysis[0].SoilNitrogenSupplyIndex
      //             : "Not Entered",
      //         SNSMethod: "Not Entered",
      //       }
      //     : null;

      const pkBalance = await this.pkBalanceRepository.findOne({
        where: { FieldID: field.ID, Year: year },
      });
      // Enrich crops with management periods and their sub-objects
      let soilAnalysis = null;
      if (crops != null) {
        for (const crop of crops) {
          if (crop.CropTypeID === CropTypeMapper.GRASS) {
            let swardType = null;
            let defoliationSequenceDescription = null;
            let swardTypeManagment = null;
            if (
              crop.SwardTypeID != null &&
              crop.PotentialCut != null &&
              crop.DefoliationSequenceID != null
            ) {
              defoliationSequenceDescription =
                await this.findDefoliationSequenceDescription(
                  crop.SwardManagementID,
                  crop.PotentialCut,
                  crop.DefoliationSequenceID,
                  crop.Establishment,
                );
            }
            crop.DefoliationSequenceName =
              defoliationSequenceDescription == null
                ? null
                : defoliationSequenceDescription;
            if (crop.SwardTypeID != null) {
              swardType = await this.findSwardType(crop.SwardTypeID);
            }
            crop.SwardTypeName = swardType === null ? null : swardType;
            if (crop.SwardManagementID != null) {
              swardTypeManagment = await this.findSwardTypeManagment(
                crop.SwardManagementID,
              );
            }
            crop.SwardManagementName =
              swardTypeManagment == null ? null : swardTypeManagment;
            crop.EstablishmentName =
              crop.CropTypeID === CropTypeMapper.GRASS &&
              crop.Establishment != null
                ? await this.findGrassSeason(crop.Establishment)
                : null;
          }
        }
      }

      const cropsWithManagement = [];
      for (const crop of crops) {
        let isSoilAnalysisAdded = null;
        try {
          // Fetch SNS analysis
          const snsAnalysis = await this.snsAnalysisRepository.findOne({
            where: { CropID: crop.ID },
          });
          const SNSAnalysis = snsAnalysis
            ? {
                SNSValue: snsAnalysis.SoilNitrogenSupplyValue,
                SNSIndex: snsAnalysis.SoilNitrogenSupplyIndex,
                SNSMethod: "Not Entered",
              }
            : null;
          // Fetch management periods related to the crop
          const managementPeriods =
            await this.managementPeriodRepository.find({
              where: { CropID: crop.ID },
            });

          // Process management data
          const managementWithSubData = [];
          for (const managementPeriod of managementPeriods) {
            const organicManures = await this.organicManureRepository.find({
              where: { ManagementPeriodID: managementPeriod.ID },
            });

            // Add manure-related names to each OrganicManure object
            const organicManuresWithNames = [];
            for (const manure of organicManures) {
              const manureTypeName = await this.getManureTypeName(
                manure.ManureTypeID,
                allManureData,
              );
              const applicationMethodName =
                await this.getApplicationMethodName(
                  manure.ApplicationMethodID,
                  allApplicationMethodsData,
                );
              const incorporationMethodName =
                await this.getIncorporationMethodName(
                  manure.IncorporationMethodID,
                  allIncorporationMethodsData,
                );
              const incorporationDelayName =
                await this.getIncorporationDelayName(
                  manure.IncorporationDelayID,
                  allIncorporationDelaysData,
                );

              organicManuresWithNames.push({
                ...manure,
                ManureTypeName: manureTypeName,
                ApplicationMethodName: applicationMethodName,
                IncorporationMethodName: incorporationMethodName,
                IncorporationDelayName: incorporationDelayName,
              });
            }

            // Fetch recommendation based on management period
            const recommendation =
              await this.recommendationRepository.findOne({
                where: { ManagementPeriodID: managementPeriod.ID },
              });

            if (isSoilAnalysisAdded == null) {
              const fiveYearBack = 5;
              const fiveYearsAgo = year - fiveYearBack;
              const currentYear = year;
              const soilAnalysisRecordsList =
                await this.soilAnalysisRepository.find({
                  where: {
                    FieldID: field.ID,
                    Year: Between(fiveYearsAgo, currentYear),
                  },
                  order: { Date: "DESC" }, // Most recent first
                  take: 1, // Only 1 record
                });

              const soilAnalysisRecords = soilAnalysisRecordsList[0] || null;

              //fetch soil aalysis data
              if (recommendation && soilAnalysisRecords != null) {
                soilAnalysis = {
                  SulphurDeficient: soilAnalysisRecords.SulphurDeficient,
                  Date: soilAnalysisRecords.Date,
                  PH: recommendation.PH,
                  PhosphorusMethodologyID:
                    soilAnalysisRecords.PhosphorusMethodologyID,
                  PhosphorusIndex: recommendation.PIndex,
                  PotassiumIndex: recommendation.KIndex,
                  MagnesiumIndex: recommendation.MgIndex,
                  PhosphorusStatus: soilAnalysisRecords.PhosphorusStatus,
                  PotassiumStatus: soilAnalysisRecords.PotassiumStatus,
                  MagnesiumStatus: soilAnalysisRecords.MagnesiumStatus,
                  OrganicMatter: soilAnalysisRecords.OrganicMatterPercentage,
                };
                isSoilAnalysisAdded = true;
              } else {
                soilAnalysis = null;
              }
            }
            // Fetch recommendations using stored procedure
            const storedProcedure =
              "EXEC dbo.spRecommendations_GetRecommendations @fieldId = @0, @harvestYear = @1";
            const recommendations = await this.executeQuery(storedProcedure, [
              field.ID,
              year,
            ]);

            let mergedRecommendation = null;
            if (recommendations != null) {
              const recBasedOnManId = recommendations.filter(
                (rec) => rec.ManagementPeriod_ID === managementPeriod.ID,
              );
              if (recBasedOnManId != null) {
                for (const r of recBasedOnManId) {
                  const data = {
                    Crop: {},
                    Recommendation: {},
                    ManagementPeriod: {},
                    FertiliserManure: {},
                  };

                  const previousAppliedLime =
                    await this.processSoilRecommendations(year, field.ID, r);
                  data.Recommendation.PreviousAppliedLime =
                    previousAppliedLime || 0;

                   const PREFIXES = {
                     CROP: "Crop_",
                     RECOMMENDATION: "Recommendation_",
                     MANAGEMENT_PERIOD: "ManagementPeriod_",
                     FERTILISER_MANURE: "FertiliserManure_",
                   }; 
              
                  Object.keys(r).forEach((recDataKey) => {
                    if (recDataKey.startsWith(PREFIXES.CROP)) {
                      data.Crop[recDataKey.slice(PREFIXES.CROP.length)] =
                        r[recDataKey];
                    } else if (recDataKey.startsWith(PREFIXES.RECOMMENDATION)) {
                      data.Recommendation[recDataKey.slice(PREFIXES.RECOMMENDATION.length)] =
                        r[recDataKey];
                    } else if (recDataKey.startsWith(PREFIXES.MANAGEMENT_PERIOD)) {
                      data.ManagementPeriod[recDataKey.slice(PREFIXES.MANAGEMENT_PERIOD.length)] =
                        r[recDataKey];
                    } else if (recDataKey.startsWith(PREFIXES.FERTILISER_MANURE)) {
                      data.FertiliserManure[recDataKey.slice(PREFIXES.FERTILISER_MANURE.length)] =
                        r[recDataKey];
                    } else {
                      console.log("no assignment");
                    }
                  });

                  mergedRecommendation = {
                    ...data.Recommendation,
                    ...data.FertiliserManure, // Add FertiliserManure properties to Recommendation
                  };
                }
              }
            }

            // Fetch comments for the recommendation
            const recommendationComments = recommendation
              ? await this.recommendationCommentsRepository.find({
                  where: { RecommendationID: recommendation.ID },
                })
              : [];

            // Fetch fertiliser manures for the management period
            const fertiliserManures =
              await this.fertiliserManureRepository.find({
                where: { ManagementPeriodID: managementPeriod.ID },
              });

            managementWithSubData.push({
              ...managementPeriod,
              OrganicManures: organicManuresWithNames,
              Recommendation: recommendation
                ? {
                    ...(mergedRecommendation == null
                      ? recommendation
                      : mergedRecommendation),
                    RecommendationComments: recommendationComments,
                  }
                : null,
              FertiliserManures: fertiliserManures,
            });
          }

          // Fetch crop type and other crop-related information
          const cropTypeName = await this.getCropTypeName(
            crop.CropTypeID,
            cropTypeAllData,
          );
          const cropInfo1Name = crop.CropInfo1
            ? await this.getCropInfo1Name(crop.CropTypeID, crop.CropInfo1)
            : "";
          const cropInfo2Name = crop.CropInfo2
            ? await this.getCropInfo2Name(crop.CropInfo2)
            : "";

          cropsWithManagement.push({
            ...crop,
            CropTypeName: cropTypeName,
            CropInfo1Name: cropInfo1Name,
            CropInfo2Name: cropInfo2Name,
            ManagementPeriods: managementWithSubData,
            SNSAnalysis: SNSAnalysis,
          });
        } catch (error) {
          console.error("Error processing crop", crop.ID, error);
          cropsWithManagement.push({
            ...crop,
            error: error.message,
          });
        }
      }
      // Fetch SoilTypeName by passing field.SoilTypeID
      const soil = await this.rB209SoilService.getData(
        `/Soil/SoilType/${Number(field.SoilTypeID)}`,
      );
      const soilTypeName = soil?.soilType;
      // Get SulphurDeficient from soilAnalysis
      const sulphurDeficient = soilAnalysis?.SulphurDeficient ?? null;
      let pscIndex = null;
      if (farm.CountryID === CountryMapper.SCOTLAND) {
        pscIndex = await this.pscIndexRepository.findOne({
          where: { ID: field.PscIndexID },
        });
      }

      // Create soilDetails object
      const soilDetails = {
        PscIndexName: pscIndex?.Name ?? null,
        SoilTypeId: field.SoilTypeID,
        SoilTypeName: soilTypeName,
        PotashReleasingClay: field.SoilReleasingClay,
        SulphurDeficient: sulphurDeficient,
        StartingP: pkBalance?.PBalance == null ? null : pkBalance.PBalance,
        Startingk: pkBalance?.KBalance == null ? null : pkBalance.KBalance,
      };
      console.log("soilDetails", soilDetails);
      // Build the full field object with all associated sub-objects
      const fieldData = {
        ...field,
        Management: grassManagementOptionName,
        PreviousCropID: previousCropData ? previousCropData.CropTypeID : null,
        PreviousCrop: previousCropTypeName,
        Crops: cropsWithManagement,
        // PreviousGrasses: previousGrasses,
        SoilAnalysis: soilAnalysis,
        SoilDetails: soilDetails,
      };

      // Add the field data to the list of fields
      fieldsWithRelatedData.push(fieldData);
    }),
  );

  // Add the fields to the farm object
  farm.Fields = fieldsWithRelatedData;

  // Return the enriched farm object with fields nested inside
  return { Farm: farm };
}
};

module.exports = { fieldRelatedMethods };
