const { EntitySchema } = require("typeorm");

const GrassHistoryIdMappingEntity = new EntitySchema({
  name: "GrassHistoryIdMapping",
  tableName: "GrassHistoryIdMapping",
  columns: {
    ID: {
      type: "int",
      primary: true,
      generated: true,
      name: "ID",
    },
    FirstHYFieldType: {
      type: "int",
      nullable: true,
      name: "FirstHYFieldType",
    },
    SecondHYFieldType: {
      type: "int",
      nullable: true,
      name: "SecondHYFieldType",
    },
    IsReseeded: {
      type: "bit",
      nullable: true,
      name: "IsReseeded",
    },
    IsHighClover: {
      type: "bit",
      nullable: true,
      name: "IsHighClover",
    },
    NitrogenUse: {
      type: "nvarchar",
      length: 20,
      nullable: true,
      name: "NitrogenUse",
    },
    SoilGroupCategoryID: {
      type: "int",
      nullable: true,
      name: "SoilGroupCategoryID",
    },
    CropGroupCategoryID: {
      type: "int",
      nullable: true,
      name: "CropGroupCategoryID",
    },
    GrassHistoryID: {
      type: "int",
      nullable: true,
      name: "GrassHistoryID",
    },
  },
});

module.exports = { GrassHistoryIdMappingEntity };
