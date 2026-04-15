const { EntitySchema } = require("typeorm");
const { auditColumns } = require("../../constants/audits-columns");

const PreviousGrassesEntity = new EntitySchema({
  name: "PreviousGrasses",
  tableName: "PreviousGrasses",
  columns: {
    ID: {
      type: "int",
      primary: true,
      generated: true,
    },
    FieldID: {
      type: "int",
    },
    HasGrassInLastThreeYear: {
      type: "bit",
      nullable: false,
    },
    HarvestYear: {
      type: "int",
      nullable: true,
    },
    LayDuration: {
      type: "int",
      nullable: true,
    },
    GrassManagementOptionID: {
      type: "int",
      nullable: true,
    },
    HasGreaterThan30PercentClover: {
      type: "bit",
      nullable: true,
    },
    SoilNitrogenSupplyItemID: {
      type: "int",
      nullable: true,
    },
   ...auditColumns
  },
  relations: {
    Fields: {
      type: "many-to-one",
      target: "Field",
      joinColumn: { name: "FieldID" },
      inverseSide: "PreviousGrasses",
    },
    GrassManagementOptions: {
      type: "many-to-one",
      target: "GrassManagementOptions",
      joinColumn: { name: "GrassManagementOptionID" },
      inverseSide: "PreviousGrasses",
    },
    SoilNitrogenSupplyItems: {
      type: "many-to-one",
      target: "SoilNitrogenSupplyItems",
      joinColumn: { name: "SoilNitrogenSupplyItemID" },
      inverseSide: "PreviousGrasses",
    },
    CreatedByUser: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "CreatedByID" },
      inverseSide: "CreatedPreviousGrasses",
    },
    ModifiedByUser: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "ModifiedByID" },
      inverseSide: "ModifiedPreviousGrasses",
    },
  },
});

module.exports = { PreviousGrassesEntity };
