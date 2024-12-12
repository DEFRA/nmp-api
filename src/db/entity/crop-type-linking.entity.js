const { EntitySchema } = require("typeorm");

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
    IsPerennial: {
      type: "bit",
      nullable: false,
    },
    NMaxLimit: {
      type: "int",
      nullable: true,
    },
    SNSCategoryID: {
      type: "int",
      nullable: true,
    },
  },
  relations: {
    MannerCropType: {
      type: "many-to-one",
      target: "MannerCropType",
      joinColumn: {
        name: "MannerCropTypeID",
      },
      inverseSide: "CropTypeLinkings",
    },
    SNSCategories: {
      type: "many-to-one",
      target: "SNSCategories",
      joinColumn: { name: "SNSCategoryID" },
      inverseSide: "CropTypeLinkings",
    },
  },
});

module.exports = { CropTypeLinkingEntity };
