const { SoilAnalysisEntity } = require("../db/entity/soil-analysis.entity");
const {
  SoilTypeSoilTextureEntity,
} = require("../db/entity/soil-type-soil-texture.entity");
const boom = require("@hapi/boom");
const { SnsAnalysesEntity } = require("../db/entity/sns-analysis.entity");
const {
  PreviousCroppingEntity,
} = require("../db/entity/previous-cropping.entity");
const { Between } = require("typeorm");
const { CropTypeMapper } = require("../constants/crop-type-mapper");

const fieldQueryMethods = {
  async getFieldCropAndSoilDetails(fieldId, year, confirm) {
    const crop = await this.cropRepository.findOneBy({
      FieldID: fieldId,
      Year: year,
      Confirm: confirm,
    });

    const soilTypeId = (await this.repository.findOneBy({ ID: fieldId }))
      ?.SoilTypeID;
    const soil = await this.rB209SoilService.getData(
      `/Soil/SoilType/${soilTypeId}`,
    );

    return {
      FieldType: crop?.FieldType,
      SoilTypeID: soilTypeId,
      SoilTypeName: soil?.soilType,
      SowingDate: crop?.SowingDate,
    };
  },

  async checkFieldExists(farmId, name, id = null) {
    return (await this.fieldCountByName(farmId, name, id)) > 0;
  },

  async fieldCountByName(farmId, name, id = null) {
    if (!farmId || !name) {
      throw boom.badRequest("Farm Id and Name are required");
    }

    const query = this.repository
      .createQueryBuilder("Fields")
      .where("Fields.Name = :name", { name: name.trim() })
      .andWhere("Fields.FarmID = :farmId", { farmId: farmId });
    if (id !== null) {
      query.andWhere("Fields.ID != :id", { id });
    }

    return query.getCount();
  },

  async getSoilTextureBySoilTypeId(soilTypeId) {
    const soilTexture = await this.soilTypeSoilTextureRepository.findOneBy({
      SoilTypeID: soilTypeId,
    });
    if (soilTypeId == null || !soilTexture) {
      return {
        TopSoilID: null,
        SubSoilID: null,
      };
    }

    return {
      TopSoilID: soilTexture.TopSoilID,
      SubSoilID: soilTexture.SubSoilID,
    };
  },

  async getFieldSoilAnalysisAndSnsAnalysisDetails(fieldId) {
    const fieldData = await this.repository.findOneBy({
      ID: fieldId,
    });

    const soilAnalysisData = await this.soilAnalysisRepository.findOne({
      where: { FieldID: fieldId },

      order: { Year: "DESC", Date: "DESC" },
    });

    const cropData = await this.cropRepository.findOne({
      where: {
        FieldID: fieldId,
      },
      order: {
        Year: "ASC",
      },
    });
    let previousGrassesData = [];
    const previousCroppingData = await this.previousCroppingRepository.find({
      where: { FieldID: fieldId },
    });
    if (previousCroppingData.CropTypeID === CropTypeMapper.GRASS) {
      previousGrassesData = previousCroppingData;
    }
    return {
      Field: fieldData,
      SoilAnalysis: soilAnalysisData,
      // SnsAnalyses: snsAnalysisData,
      Crop: cropData,
      PreviousGrasses: previousGrassesData,
    };
  },

  async getCropTypeName(cropTypeID, cropTypeAllData) {
    // Find the crop type in cropTypeAllData by matching cropTypeId
    const cropType = cropTypeAllData.find(
      (item) => item.cropTypeId === cropTypeID,
    );

    // Check if the cropType is found
    if (cropType) {
      return cropType.cropType;
    } else {
      throw new Error("Crop type not found");
    }
  },

  async getCropInfo1Name(cropTypeID, cropInfo1Id) {
    const cropType = await this.rB209ArableService.getData(
      `/Arable/CropInfo1/${cropTypeID}/${cropInfo1Id}`,
    );
    return cropType.cropInfo1Name;
  },

  async getCropInfo2Name(cropInfo2Id) {
    const cropType = await this.rB209ArableService.getData(
      `/Arable/CropInfo2/${cropInfo2Id}`,
    );
    return cropType.cropInfo2Name;
  },

  async getManureTypeName(ManureTypeID, manureTypesResponse) {
    const manureTypeData = manureTypesResponse.find(
      (mt) => mt.id === ManureTypeID,
    );

    return manureTypeData.name;
  },

  async fetchAllApplicationReferenceData(request) {
    const allManureData =
      await this.MannerManureTypesService.getAllManureTypesList(request);
    const allApplicationMethodsData =
      await this.MannerApplicationMethodService.getData(
        "/application-methods",
        request,
      );

    const allIncorporationMethodsData =
      await this.MannerIncorporationMethodService.getData(
        "/incorporation-methods",
        request,
      );

    const allIncorporationDelaysData =
      await this.MannerIncorporationDelayService.getData(
        "/incorporation-delays",
        request,
      );

    return {
      allManureData: allManureData.data,
      allApplicationMethodsData: allApplicationMethodsData.data,
      allIncorporationMethodsData: allIncorporationMethodsData.data,
      allIncorporationDelaysData: allIncorporationDelaysData.data,
    };
  },

  async getApplicationMethodName(
    ApplicationMethodID,
    allApplicationMethodsData,
  ) {
    const applicationMethodData = allApplicationMethodsData.find(
      (mt) => mt.id === ApplicationMethodID,
    );
    return applicationMethodData.name;
  },

  async getIncorporationMethodName(
    IncorporationMethodID,
    allIncorporationMethodsData,
  ) {
    const incorporationMethodData = allIncorporationMethodsData.find(
      (mt) => mt.id === IncorporationMethodID,
    );
    return incorporationMethodData.name;
  },

  async getIncorporationDelayName(
    IncorporationDelayID,
    allIncorporationDelaysData,
  ) {
    const incorporationDelayData = allIncorporationDelaysData.find(
      (mt) => mt.id === IncorporationDelayID,
    );
    return incorporationDelayData.name;
  },

  async getPreviousCropDataByFieldID(fieldID) {
    let previousGrasses = {};
    const previousCroppingData = await this.previousCroppingRepository.findOne({
      where: { FieldID: fieldID },
    });
    if (previousCroppingData?.CropTypeID === CropTypeMapper.GRASS) {
      previousGrasses = previousCroppingData;
    }
    return previousGrasses;
  },

  async handleSoilAnalysisValidation(fieldId, year) {
    const errors = [];
    const fiveYearsAgo = year - 4;

    // Fetch all soil analyses for the last 5 years
    const soilAnalysisRecordsFiveYears = await this.soilAnalysisRepository.find(
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
      "Date",
      "PH",
      "SoilNitrogenSupplyIndex",
      "PhosphorusIndex",
      "PotassiumIndex",
      "MagnesiumIndex",
      "SulphurDeficient",
      "CreatedOn",
      "ModifiedOn",
    ];
    console.log("soilAnalysisRecordsFiveYears", soilAnalysisRecordsFiveYears);
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
    const isEmpty = Object.values(latestSoilAnalysis).every(
      (value) => value === null,
    );
    if (isEmpty) {
      return { latestSoilAnalysis: null, errors };
    }

    return { latestSoilAnalysis, errors };
  },

  async findSwardTypeManagment(SwardManagementID) {
    try {
      let swardManagementsName = null;
      const swardManagementsList = await this.rB209GrassService.getData(
        `Grass/SwardManagements`,
      );

      if (swardManagementsList.length > 0) {
        const matchingSward = swardManagementsList.find(
          (x) => x.swardManagementId === SwardManagementID,
        );
        if (matchingSward != null) {
          swardManagementsName = matchingSward
            ? matchingSward.swardManagement
            : null;
        }
      }
      console.log("swardManagementsName", swardManagementsName);
      return swardManagementsName;
    } catch (error) {
      console.error(`Error fetching sward Management list`, error);
      return "Unknown";
    }
  },

  async findDefoliationSequenceDescription(
    swardManagementId,
    PotentialCut,
    DefoliationSequenceID,
    establishment,
  ) {
    try {
      const newSward = !(establishment === 0 || null);
      let defoliationSequenceDescription = null;
      const defoliationSequenceList = await this.rB209GrassService.getData(
        `Grass/DefoliationSequence/${swardManagementId}/${PotentialCut}/${newSward}`,
      );
      if (
        defoliationSequenceList.data &&
        Array.isArray(defoliationSequenceList.data.list) &&
        defoliationSequenceList.data.list.length > 0
      ) {
        const matchingDefoliation = defoliationSequenceList.data.list.find(
          (x) => x.defoliationSequenceId === DefoliationSequenceID,
        );
        if (matchingDefoliation != null) {
          defoliationSequenceDescription = matchingDefoliation
            ? matchingDefoliation.defoliationSequenceDescription
            : null;
        }
      }

      return defoliationSequenceDescription;
    } catch (error) {
      console.error(
        `Error fetching Defoliation Sequence for swardTypeId: & numberOfCuts=${PotentialCut}`,
        error,
      );
      return "Unknown";
    }
  },

  async findSwardType(SwardTypeID) {
    try {
      let swardTypeName = null;
      const swardTypeList =
        await this.rB209GrassService.getData(`Grass/SwardTypes`);

      if (swardTypeList.length > 0) {
        const matchingSward = swardTypeList.find(
          (x) => x.swardTypeId === SwardTypeID,
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
        `Grassland/GrasslandSeason/${seasonID}`,
      );
      return season.seasonName;
    } catch (error) {
      console.error(`Error fetching Grassland Season`, error);
      return "Unknown";
    }
  },
};

module.exports = { fieldQueryMethods };
