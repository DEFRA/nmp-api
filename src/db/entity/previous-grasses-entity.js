const { EntitySchema } = require("typeorm");
const { auditColumns } = require("../../constants/audits-columns");
const { RELATION_TYPES } = require("../../constants/relations-mapper");
const relations = {
  Fields: {
    type: RELATION_TYPES.MANY_TO_ONE,
    target: "Field",
    joinColumn: { name: "FieldID" },
    inverseSide: "PreviousGrasses",
  },
  GrassManagementOptions: {
    type: RELATION_TYPES.MANY_TO_ONE,
    target: "GrassManagementOptions",
    joinColumn: { name: "GrassManagementOptionID" },
    inverseSide: "PreviousGrasses",
  },
  SoilNitrogenSupplyItems: {
    type: RELATION_TYPES.MANY_TO_ONE,
    target: "SoilNitrogenSupplyItems",
    joinColumn: { name: "SoilNitrogenSupplyItemID" },
    inverseSide: "PreviousGrasses",
  },
  CreatedByUser: {
    type: RELATION_TYPES.MANY_TO_ONE,
    target: "User",
    joinColumn: { name: "CreatedByID" },
    inverseSide: "CreatedPreviousGrasses",
  },
  ModifiedByUser: {
    type: RELATION_TYPES.MANY_TO_ONE,
    target: "User",
    joinColumn: { name: "ModifiedByID" },
    inverseSide: "ModifiedPreviousGrasses",
  },
};
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
    ...auditColumns,
  },
  relations: relations
});

module.exports = { PreviousGrassesEntity };
 