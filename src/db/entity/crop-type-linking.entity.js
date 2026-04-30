const { EntitySchema } = require("typeorm");
const { RELATION_TYPES } = require("../../constants/relations-mapper");

const CropTypeLinkingEntity = new EntitySchema({
  name: "CropTypeLinking",
  tableName: "CropTypeLinkings",
  columns: {
    CropTypeID: {
      type: "int",
      primary: true,
    },
    MannerCropTypeID: {
      type: "int",
      primary: true,
    },
    DefaultYield: {
      type: "decimal",
      precision: 18,
      scale: 1,
      nullable: true,
    },
    DefaultYieldScotland: {
      type: "decimal",
      precision: 18,
      scale: 1,
      nullable: true,
    },
    IsPerennial: {
      type: "bit",
      nullable: false,
    },
    NMaxLimitEngland: {
      type: "int",
      nullable: true,
    },
    NMaxLimitWales: {
      type: "int",
      nullable: true,
    },
    SNSCategoryID: {
      type: "int",
      nullable: true,
    },
    CropInfoOneQuestionID: {
      type: "int",
      nullable: true,
    },
    CropInfoOneScotlandQuestionID: {
      type: "int",
      nullable: true,
    },
    LateSownMannerCropTypeID: {
      type: "int",
      nullable: true,
    },
  },
  relations: {
    MannerCropType: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "MannerCropType",
      joinColumn: {
        name: "MannerCropTypeID",
      },
      inverseSide: "CropTypeLinkings",
    },
    SNSCategories: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "SNSCategories",
      joinColumn: { name: "SNSCategoryID" },
      inverseSide: "CropTypeLinkings",
    },
    CropInfoOneQuestion: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "CropInfoQuestions",
      joinColumn: { name: "CropInfoOneQuestionID" },
      inverseSide: "CropTypeLinking",
    },
    CropInfoOneScotlandQuestion: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "CropInfoQuestions",
      joinColumn: { name: "CropInfoOneScotlandQuestionID" },
      inverseSide: "CropTypeLinking",
    },
  },
});

module.exports = { CropTypeLinkingEntity };
