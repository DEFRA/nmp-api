const { EntitySchema } = require("typeorm");
const { auditColumns } = require("../../constants/audits-columns");
const { RELATION_TYPES } = require("../../constants/relations-mapper");
const { previousGrassRelations } = require("../../constants/previous-grass-entitiy-relations");

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
  relations: previousGrassRelations
});

module.exports = { PreviousGrassesEntity };
 