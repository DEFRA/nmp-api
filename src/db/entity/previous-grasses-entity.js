const { EntitySchema } = require("typeorm");
const { auditColumns } = require("../../constants/audits-columns");
const { RELATION_TYPES } = require("../../constants/relations-mapper");
const { previousGrassRelations, previousRelations } = require("../../constants/previous-grass-entitiy-relations");

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
  relations: {
    ...previousRelations,

    Fields: {
      ...previousRelations.Fields,
      target: "Field",
      inverseSide: "PreviousGrasses",
    },
    GrassManagementOptions: {
      ...previousRelations.GrassManagementOptions,
      inverseSide: "PreviousGrasses",
    },
    SoilNitrogenSupplyItems: {
      ...previousRelations.SoilNitrogenSupplyItems,
      inverseSide: "PreviousGrasses",
    },
    CreatedByUser: {
      ...previousRelations.CreatedByUser,
      inverseSide: "CreatedPreviousGrasses",
    },
    ModifiedByUser: {
      ...previousRelations.ModifiedByUser,
      inverseSide: "ModifiedPreviousGrasses",
    },
  },
});

module.exports = { PreviousGrassesEntity };
 