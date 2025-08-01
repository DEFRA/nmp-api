const { EntitySchema } = require("typeorm");

const NutrientsLoadingLiveStocksEntity = new EntitySchema({
  name: "NutrientsLoadingLiveStocks",
  tableName: "NutrientsLoadingLiveStocks",
  columns: {
    ID: {
      type: "int",
      primary: true,
      generated: true,
      name: "ID",
    },
    FarmID: {
      type: "int",
      nullable: false,
      name: "FarmID",
    },
    CalendarYear: {
      type: "int",
      nullable: false,
      name: "CalendarYear",
    },
    LiveStockTypeID: {
      type: "int",
      nullable: true,
      name: "LiveStockTypeID",
    },
    Units: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
      name: "Units",
    },
    NByUnit: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
      name: "NByUnit",
    },
    TotalNProduced: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
      name: "TotalNProduced",
    },
    Occupancy: {
      type: "int",
      nullable: true,
      name: "Occupancy",
    },
    PByUnit: {
      type: "decimal",
      precision: 18,
      scale: 0,
      nullable: true,
      name: "PByUnit",
    },
    TotalPProduced: {
      type: "int",
      nullable: true,
      name: "TotalPProduced",
    },
    Jan: {
      type: "int",
      nullable: true,
      name: "Jan",
    },
    Feb: {
      type: "int",
      nullable: true,
      name: "Feb",
    },
    Mar: {
      type: "int",
      nullable: true,
      name: "Mar",
    },
    Apr: {
      type: "int",
      nullable: true,
      name: "Apr",
    },
    May: {
      type: "int",
      nullable: true,
      name: "May",
    },
    June: {
      type: "int",
      nullable: true,
      name: "June",
    },
    July: {
      type: "int",
      nullable: true,
      name: "July",
    },
    Aug: {
      type: "int",
      nullable: true,
      name: "Aug",
    },
    Sep: {
      type: "int",
      nullable: true,
      name: "Sep",
    },
    Oct: {
      type: "int",
      nullable: true,
      name: "Oct",
    },
    Nov: {
      type: "int",
      nullable: true,
      name: "Nov",
    },
    Dec: {
      type: "int",
      nullable: true,
      name: "Dec",
    },
    CreatedOn: {
      type: "datetime2",
      precision: 7,
      nullable: true,
      name: "CreatedOn",
    },
    CreatedByID: {
      type: "int",
      nullable: true,
      name: "CreatedByID",
    },
    ModifiedOn: {
      type: "datetime2",
      precision: 7,
      nullable: true,
      name: "ModifiedOn",
    },
    ModifiedByID: {
      type: "int",
      nullable: true,
      name: "ModifiedByID",
    },
  },
  relations: {
    Farm: {
      type: "many-to-one",
      target: "Farms",
      joinColumn: { name: "FarmID" },
      inverseSide: "NutrientsLoadingLiveStocks",
    },
    NutrientsLoadingLiveStocksGroup: {
      type: "many-to-one",
      target: "LivestockGroups",
      joinColumn: { name: "LiveStockGroupID" },
      inverseSide: "LivestockGroupsIdInLiveStocks",
    },
    NutrientsLoadingLiveStocksType: {
      type: "many-to-one",
      target: "LivestockTypes",
      joinColumn: { name: "LiveStockTypeID" },
      inverseSide: "LivestockGroupsIdInLiveStocks",
    },
    CreatedBy: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "CreatedByID" },
      inverseSide: "CreatedNutrientsLoadingLiveStocks",
    },
    ModifiedBy: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "ModifiedByID" },
      inverseSide: "ModifiedNutrientsLoadingLiveStocks",
    },
  },
});

module.exports = { NutrientsLoadingLiveStocksEntity };
