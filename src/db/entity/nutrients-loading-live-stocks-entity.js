const { EntitySchema } = require("typeorm");

const NutrientsLoadingLiveStocksEntity = new EntitySchema({
  name: "NutrientsLoadingLiveStocks",
  tableName: "NutrientsLoadingLiveStocks",
  columns: {
    Id: {
      type: "int",
      primary: true,
      generated: true,
      name: "Id",
    },
    FarmId: {
      type: "int",
      nullable: false,
      name: "FarmId",
    },
    LiveStockGroupId: {
      type: "int",
      nullable: false,
      name: "LiveStockGroupId",
    },
    LiveStockGroup: {
      type: "nvarchar",
      length: 250,
      nullable: true,
      name: "LiveStockGroup",
    },
    LiveStockTypeId: {
      type: "int",
      nullable: true,
      name: "LiveStockTypeId",
    },
    LiveStockType: {
      type: "nvarchar",
      length: 250,
      nullable: true,
      name: "LiveStockType",
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
  },
});

module.exports = { NutrientsLoadingLiveStocksEntity };
