const { RELATION_TYPES } = require("./relations-mapper");


const previousRelations = {
  Fields: {
    type: RELATION_TYPES.MANY_TO_ONE,
    target: "Field", // default (can override)
    joinColumn: { name: "FieldID" },
    inverseSide: "", // MUST override
  },
  GrassManagementOptions: {
    type: RELATION_TYPES.MANY_TO_ONE,
    target: "GrassManagementOptions",
    joinColumn: { name: "GrassManagementOptionID" },
    inverseSide: "", // MUST override
  },
  SoilNitrogenSupplyItems: {
    type: RELATION_TYPES.MANY_TO_ONE,
    target: "SoilNitrogenSupplyItems",
    joinColumn: { name: "SoilNitrogenSupplyItemID" },
    inverseSide: "", // MUST override
  },
  CreatedByUser: {
    type: RELATION_TYPES.MANY_TO_ONE,
    target: "User",
    joinColumn: { name: "CreatedByID" },
    inverseSide: "", // MUST override
  },
  ModifiedByUser: {
    type: RELATION_TYPES.MANY_TO_ONE,
    target: "User",
    joinColumn: { name: "ModifiedByID" },
    inverseSide: "", // MUST override
  },
};

module.exports = { previousRelations };
