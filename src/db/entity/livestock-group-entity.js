const { EntitySchema } = require("typeorm");

const LivestockGroupEntity = new EntitySchema({
  name: "LivestockGroups",
  tableName: "LivestockGroups",
  columns: {
    ID: {
      type: "int",
      primary: true,
      generated: true,
      name: "ID",
    },
    Name: {
      type: "nvarchar",
      length: 50,
      nullable: false,
      name: "Name",
    },
  },
  relations: {
    LivestockGroupIdInTypes: {
      type: "one-to-many",
      target: "LivestockTypes",
      joinColumn: {
        name: "ID",
      },
      inverseSide: "LivestockGroup",
    },
    // LivestockGroupsIdInLiveStocksNutrients: {
    //   type: "one-to-many",
    //   target: "NutrientsLoadingLiveStocks",
    //   joinColumn: {
    //     name: "ID",
    //   },
    //   inverseSide: "NutrientsLoadingLiveStocksGroup",
    // },
  },
});

module.exports = { LivestockGroupEntity };
