const { EntitySchema } = require("typeorm");

const ExcessRainfallsEntity = new EntitySchema({
  name: "ExcessRainfalls", // Entity name
  tableName: "ExcessRainfalls", // Table name in the database
  columns: {
    FarmID: {
      type: "int",
      primary: true,
    },
    Year: {
      type: "int",
      primary: true,
    },
    ExcessRainfall: {
      type: "int",
      nullable: true,
      default: 0, // Default value as per the constraint in SQL
    },
    WinterRainfall: {
      type: "int",
      nullable: true,
    },
    CreatedOn: {
      type: "datetime2",
      precision: 7,
      nullable: true,
      default: () => "getdate()", // Default value in SQL is the current date
    },
    CreatedByID: {
      type: "int",
      nullable: true,
    },
    ModifiedOn: {
      type: "datetime2",
      precision: 7,
      nullable: true,
    },
    ModifiedByID: {
      type: "int",
      nullable: true,
    },
  },
  relations: {
    Farm: {
      type: "many-to-one",
      target: "Farms",
      joinColumn: { name: "FarmID" },
      inverseSide: "ExcessRainfalls", // Adjust this based on inverse side in Farms entity
    },
    CreatedByUser: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "CreatedByID" },
      inverseSide: "CreatedExcessRainfalls", // Adjust this based on inverse side in Users entity
    },
    ModifiedByUser: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "ModifiedByID" },
      inverseSide: "ModifiedExcessRainfalls", // Adjust this based on inverse side in Users entity
    },
  },
});

module.exports = { ExcessRainfallsEntity };
