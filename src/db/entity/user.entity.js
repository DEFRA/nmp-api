const { EntitySchema } = require("typeorm");
const { RELATION_TYPES } = require("../../constants/relations-mapper");

const UserEntity = new EntitySchema({
  name: "User",
  tableName: "Users",
  columns: {
    ID: {
      type: "int",
      primary: true,
      generated: true,
    },
    GivenName: {
      type: "nvarchar",
      length: 50,
    },
    Surname: {
      type: "nvarchar",
      length: 50,
      nullable: true,
    },
    Email: {
      type: "nvarchar",
      length: 256,
    },
    UserIdentifier: {
      type: "uniqueidentifier",
      nullable: true,
      unique: true,
    },
  },
  relations: {
    CreatedCrops: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "Crop",
      joinColumn: { name: "ID" },
      inverseSide: "CreatedByUser",
    },
    ModifiedCrops: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "Crop",
      joinColumn: { name: "ID" },
      inverseSide: "ModifiedByUser",
    },
    CreatedManagementPeriods: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "ManagementPeriod",
      JoinColumn: "ID",
      inverseSide: "CreatedByUser",
    },
    ModifiedManagementPeriods: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "ManagementPeriod",
      JoinColumn: "ID",
      inverseSide: "ModifiedByUser",
    },
    Fields: {
      target: "Field",
      type: RELATION_TYPES.ONE_TO_MANY,
      inverseSide: "ModifiedByUser",
      joinColumn: { name: "ID" },
    },
    CreatedRecommendations: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "Recommendation",
      JoinColumn: "ID",
      inverseSide: "CreatedByUser",
    },
    ModifiedRecommendations: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "Recommendation",
      JoinColumn: "ID",
      inverseSide: "ModifiedByUser",
    },
    CreatedRecommendationComments: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "RecommendationComment",
      JoinColumn: "ID",
      inverseSide: "CreatedByUser",
    },
    ModifiedRecommendationComments: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "RecommendationComment",
      JoinColumn: "ID",
      inverseSide: "ModifiedByUser",
    },
    CreatedOrganicManures: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "OrganicManure",
      JoinColumn: "ID",
      inverseSide: "CreatedByUser",
    },
    ModifiedOrganicManures: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "OrganicManure",
      JoinColumn: "ID",
      inverseSide: "ModifiedByUser",
    },
    CreatedFertiliserManures: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "FertiliserManures",
      joinColumn: "ID",
      inverseSide: "CreatedByUser",
    },
    ModifiedFertiliserManures: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "FertiliserManures",
      joinColumn: "ID",
      inverseSide: "ModifiedByUser",
    },
    CreatedFarms: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "Farm",
      joinColumn: "ID",
      inverseSide: "CreatedByUser",
    },
    ModifiedFarms: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "Farm",
      joinColumn: "ID",
      inverseSide: "ModifiedByUser",
    },

    CreatedSnsAnalyses: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "SnsAnalyses",
      inverseSide: "CreatedByUser",
      joinColumn: { name: "ID" },
    },
    ModifiedSnsAnalyses: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "SnsAnalyses",
      inverseSide: "ModifiedByUser",
      joinColumn: { name: "ID" },
    },
    CreatedPreviousGrasses: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "PreviousGrasses",
      inverseSide: "CreatedByUser",
      joinColumn: { name: "ID" },
    },
    ModifiedPreviousGrasses: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "PreviousGrasses",
      inverseSide: "ModifiedByUser",
      joinColumn: { name: "ID" },
    },
    CreatedExcessRainfalls: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "ExcessRainfalls",
      inverseSide: "CreatedByUser",
      joinColumn: { name: "ID" },
    },
    ModifiedExcessRainfalls: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "ExcessRainfalls",
      inverseSide: "ModifiedByUser",
      joinColumn: { name: "ID" },
    },
    UserExtensions: {
      target: "UserExtensions",
      type: RELATION_TYPES.ONE_TO_MANY,
      inverseSide: "User",
      joinColumn: { name: "ID" },
    },

    CreatedNutrientsLoadingLiveStocks: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "NutrientsLoadingLiveStocks",
      joinColumn: "ID",
      inverseSide: "CreatedBy",
    },
    ModifiedNutrientsLoadingLiveStocks: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "NutrientsLoadingLiveStocks",
      joinColumn: "ID",
      inverseSide: "ModifiedBy",
    },
    CreatedStoreCapacitiesByUser: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "StoreCapacities",
      inverseSide: "CreatedBy",
      joinColumn: { name: "ID" },
    },
    ModifiedStoreCapacitiesByUser: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "StoreCapacities",
      inverseSide: "ModifiedBy",
      joinColumn: { name: "ID" },
    },
    CreatedWarningMessagesByUser: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "WarningMessages",
      inverseSide: "CreatedBy",
      joinColumn: { name: "ID" },
    },
    ModifiedWarningMessagesByUser: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "WarningMessages",
      inverseSide: "ModifiedBy",
      joinColumn: { name: "ID" },
    },
    CreatedPreviousCroppings: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "PreviousCroppings",
      inverseSide: "ModifiedByUser",
      joinColumn: { name: "ID" },
    },
    ModifiedPreviousCroppings: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "PreviousCroppings",
      inverseSide: "ModifiedByUser",
      joinColumn: { name: "ID" },
    },
    CreatedFarmsNvz: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "FarmsNVZ",
      inverseSide: "CreatedByUserFarmNvz",
      joinColumn: { name: "ID" },
    },
    ModifiedFarmsNvz: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "FarmsNVZ",
      inverseSide: "ModifiedByUserFarmNvz",
      joinColumn: { name: "ID" },
    },
    CreatedFarmAverageYields: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "FarmAverageYields",
      inverseSide: "CreatedByUser",
      joinColumn: { name: "ID" },
    },
    ModifiedFarmAverageYields: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "FarmAverageYields",
      inverseSide: "ModifiedByUser",
      joinColumn: { name: "ID" },
    },
    CreatedMannerEstimations: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "MannerEstimations",
      inverseSide: "CreatedByUser",
      joinColumn: { name: "ID" },
    },
    ModifiedMannerEstimations: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "MannerEstimations",
      inverseSide: "ModifiedByUser",
      joinColumn: { name: "ID" },
    },
    CreatedMannerEstimationApplications: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "MannerEstimationApplications",
      inverseSide: "CreatedByUser",
      joinColumn: { name: "ID" },
    },
    ModifiedMannerEstimationApplications: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "MannerEstimationApplications",
      inverseSide: "ModifiedByUser",
      joinColumn: { name: "ID" },
    },
  },
});

module.exports = { UserEntity };
