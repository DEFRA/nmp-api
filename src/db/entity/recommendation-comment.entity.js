const { EntitySchema } = require("typeorm");

const RecommendationCommentEntity = new EntitySchema({
  name: "RecommendationComment",
  tableName: "RecommendationComments",
  columns: {
    ID: {
      type: "int",
      primary: true,
      generated: true,
      generatedIdentity: "ALWAYS",
    },
    RecommendationID: {
      type: "int",
    },
    Nutrient: {
      type: "int",
      default: 0,
    },
    Comment: {
      type: "nvarchar",
      nullable: true,
    },
    CreatedOn: {
      type: "datetime2",
      precision: 7,
      nullable: true,
      default: () => "GETDATE()",
    },
    ModifiedOn: {
      type: "datetime2",
      precision: 7,
      nullable: true,
    },
    CreatedByID: {
      type: "int",
      nullable: true,
    },
    ModifiedByID: {
      type: "int",
      nullable: true,
    },
    PreviousID: {
      type: "int",
      nullable: true,
    },
  },
  relations: {
    Recommendation: {
      type: "many-to-one",
      target: "Recommendation",
      joinColumn: { name: "RecommendationID" },
      inverseSide: "RecommendationComments",
    },
    CreatedByUser: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "CreatedByID" },
      inverseSide: "CreatedRecommendationComments",
    },
    ModifiedByUser: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "ModifiedByID" },
      inverseSide: "ModifiedRecommendationComments",
    },
  },
});

module.exports = { RecommendationCommentEntity };
