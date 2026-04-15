const { EntitySchema } = require("typeorm");
const { RELATION_TYPES } = require("../../constants/relations-mapper");
const { auditColumns } = require("../../constants/audits-columns");




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
    ...auditColumns,
  },
  relations: {
    Farms: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "Farm",
      joinColumn: { name: "FarmID" },
      inverseSide: "FarmsNVZ",
    },
    CreatedByUserFarmNvz: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "User",
      joinColumn: { name: "CreatedByID" },
      inverseSide: "CreatedFarmsNVZ",
    },
    ModifiedByUserFarmNvz: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "User",
      joinColumn: { name: "ModifiedByID" },
      inverseSide: "ModifiedFarmsNVZ",
    },
  },
});

module.exports = { FarmsNVZEntity };
