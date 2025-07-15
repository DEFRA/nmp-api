const { EntitySchema } = require("typeorm");

const PreviousGrassIdMappingEntity = new EntitySchema({
  name: "PreviousGrassIdMapping",
  tableName: "PreviousGrassIdMapping",
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
    ThirdHYFieldType: {
      type: "int",
      nullable: true,
      name: "ThirdHYFieldType",
    },
    LayDuration: {
      type: "int",
      nullable: true,
      name: "LayDuration",
    },
    IsGrazedOnly: {
      type: "bit",
      nullable: true,
      name: "IsGrazedOnly",
    },
    IsCutOnly: {
      type: "bit",
      nullable: true,
      name: "IsCutOnly",
    },
    IsGrazedNCut: {
      type: "bit",
      nullable: true,
      name: "IsGrazedNCut",
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
    PreviousGrassID: {
      type: "int",
      nullable: true,
      name: "PreviousGrassID",
    },
  },
});

module.exports = { PreviousGrassIdMappingEntity };
