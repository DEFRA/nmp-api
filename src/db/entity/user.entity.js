const { EntitySchema } = require("typeorm");

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
      type: "one-to-many",
      target: "Crop",
      joinColumn: { name: "ID" },
      inverseSide: "CreatedByUser",
    },
    ModifiedCrops: {
      type: "one-to-many",
      target: "Crop",
      joinColumn: { name: "ID" },
      inverseSide: "ModifiedByUser",
    },
    CreatedManagementPeriods: {
      type: "one-to-many",
      target: "ManagementPeriod",
      JoinColumn: "ID",
      inverseSide: "CreatedByUser",
    },
    ModifiedManagementPeriods: {
      type: "one-to-many",
      target: "ManagementPeriod",
      JoinColumn: "ID",
      inverseSide: "ModifiedByUser",
    },
    Fields: {
      target: "Field",
      type: "one-to-many",
      inverseSide: "ModifiedByUser",
      joinColumn: { name: "ID" },
    },
    CreatedRecommendations: {
      type: "one-to-many",
      target: "Recommendation",
      JoinColumn: "ID",
      inverseSide: "CreatedByUser",
    },
    ModifiedRecommendations: {
      type: "one-to-many",
      target: "Recommendation",
      JoinColumn: "ID",
      inverseSide: "ModifiedByUser",
    },
    CreatedRecommendationComments: {
      type: "one-to-many",
      target: "RecommendationComment",
      JoinColumn: "ID",
      inverseSide: "CreatedByUser",
    },
    ModifiedRecommendationComments: {
      type: "one-to-many",
      target: "RecommendationComment",
      JoinColumn: "ID",
      inverseSide: "ModifiedByUser",
    },
    CreatedOrganicManures: {
      type: "one-to-many",
      target: "OrganicManure",
      JoinColumn: "ID",
      inverseSide: "CreatedByUser",
    },
    ModifiedOrganicManures: {
      type: "one-to-many",
      target: "OrganicManure",
      JoinColumn: "ID",
      inverseSide: "ModifiedByUser",
    },
    CreatedFertiliserManures: {
      type: "one-to-many",
      target: "FertiliserManures",
      joinColumn: "ID",
      inverseSide: "CreatedByUser",
    },
    ModifiedFertiliserManures: {
      type: "one-to-many",
      target: "FertiliserManures",
      joinColumn: "ID",
      inverseSide: "ModifiedByUser",
    },
    CreatedFarms: {
      type: "one-to-many",
      target: "Farm",
      JoinColumn: "ID",
      inverseSide: "CreatedByUser",
    },
    ModifiedFarms: {
      type: "one-to-many",
      target: "Farm",
      JoinColumn: "ID",
      inverseSide: "ModifiedByUser",
    },

    CreatedSnsAnalyses: {
      type: "one-to-many",
      target: "SnsAnalyses",
      inverseSide: "CreatedByUser", // Matches the relation in SnsAnalysesEntity
      joinColumn: { name: "ID" },
    },
    ModifiedSnsAnalyses: {
      type: "one-to-many",
      target: "SnsAnalyses",
      inverseSide: "ModifiedByUser", // Matches the relation in SnsAnalysesEntity
      joinColumn: { name: "ID" },
    },
    CreatedPreviousGrasses: {
      type: "one-to-many",
      target: "PreviousGrasses",
      inverseSide: "CreatedByUser", // Matches the relation in SnsAnalysesEntity
      joinColumn: { name: "ID" },
    },
    ModifiedPreviousGrasses: {
      type: "one-to-many",
      target: "PreviousGrasses",
      inverseSide: "ModifiedByUser", // Matches the relation in SnsAnalysesEntity
      joinColumn: { name: "ID" },
    },
    CreatedExcessRainfalls: {
      type: "one-to-many",
      target: "ExcessRainfalls",
      inverseSide: "CreatedByUser", 
      joinColumn: { name: "ID" },
    },
    ModifiedExcessRainfalls: {
      type: "one-to-many",
      target: "ExcessRainfalls",
      inverseSide: "ModifiedByUser", 
      joinColumn: { name: "ID" },
    },
  },
});

module.exports = { UserEntity };
