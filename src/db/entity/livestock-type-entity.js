const { EntitySchema } = require("typeorm");

const LivestockTypeEntity = new EntitySchema({
  name: "LivestockTypes",
  tableName: "LivestockTypes",
  columns: {
    ID: {
      type: "int",
      primary: true,
      generated: true,
      name: "ID",
    },
    Name: {
      type: "varchar",
      length: 255,
      nullable: false,
      name: "Name",
    },
    NByUnit: {
      type: "decimal",
      precision: 8,
      scale: 2,
      nullable: true,
      name: "NByUnit",
    },
    NByUnitCalc: {
      type: "decimal",
      precision: 8,
      scale: 2,
      nullable: true,
      name: "NByUnitCalc",
    },
    P2o5: {
      type: "decimal",
      precision: 8,
      scale: 2,
      nullable: true,
      name: "P2o5",
    },
    P2o5Calc: {
      type: "decimal",
      precision: 8,
      scale: 2,
      nullable: true,
      name: "P2o5Calc",
    },
    Occupancy: {
      type: "decimal",
      precision: 8,
      scale: 2,
      nullable: true,
      name: "Occupancy",
    },
    OrderBy: {
      type: "int",
      nullable: true,
      name: "OrderBy",
    },
    LivestockGroupID: {
      type: "int",
      nullable: false,
      name: "LivestockGroupID",
    },
  },
  relations: {
    LivestockGroup: {
      type: "many-to-one",
      target: "LivestockGroups",
      joinColumn: {
        name: "LivestockGroupID",
      },
      inverseSide: "LivestockGroupIdInTypes",
    },
    LivestockGroupsIdInLiveStocks: {
      type: "one-to-many",
      target: "NutrientsLoadingLiveStocks",
      joinColumn: {
        name: "ID",
      },
      inverseSide: "NutrientsLoadingLiveStocksType",
    },
  },
});

module.exports = { LivestockTypeEntity };
