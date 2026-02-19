const { EntitySchema } = require("typeorm");

const FarmsNVZEntity = new EntitySchema({
  name: "FarmsNVZ",
  tableName: "FarmsNVZ",
  columns: {
    ID: {
      type: "int",
      primary: true,
      generated: true,
      generationStrategy: "identity",
    },
    FarmID: {
      type: "int",
      nullable: false,
    },
    NVZProgrammeID: {
      type: "int",
      nullable: false,
    },
    NVZProgrammeName: {
      type: "nvarchar",
      length: 128,
    },
    CreatedOn: {
      type: "datetime2",
      nullable: true,
      precision: 7,
      default: "GETDATE()",
    },
    CreatedByID: {
      type: "int",
      nullable: true,
    },
    ModifiedOn: {
      type: "datetime2",
      nullable: true,
      precision: 7,
      default: "GETDATE()",
    },
    ModifiedByID: {
      type: "int",
      nullable: true,
    },
  },
  relations: {
    Farms: {
      type: "many-to-one",
      target: "Farm",
      joinColumn: { name: "FarmID" },
      inverseSide: "FarmsNVZ",
    },
  },
});

module.exports = { FarmsNVZEntity };
