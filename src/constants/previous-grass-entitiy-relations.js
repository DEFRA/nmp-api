const { RELATION_TYPES } = require("./relations-mapper");

const previousGrassRelations = {
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
module.exports = { previousGrassRelations };
