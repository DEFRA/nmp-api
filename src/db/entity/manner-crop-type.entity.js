const { EntitySchema } = require("typeorm");

const MannerCropTypeEntity = new EntitySchema({
  name: "MannerCropType",
  tableName: "MannerCropTypes",
  columns: {
    ID: {
      type: "int",
      primary: true,
      generated: true,
    },
    Name: {
      type: "nvarchar",
      length: 250,
    },
    Use: {
      type: "nvarchar",
      length: 50,
    },
    CropUptakeFactor: {
      type: "int",
      nullable: true,
    },
  },
  relations: {
    CropTypeLinkings: {
      type: "one-to-many",
      target: "CropTypeLinking",
      inverseSide: "MannerCropType",
    },
  },
});

module.exports = { MannerCropTypeEntity };
