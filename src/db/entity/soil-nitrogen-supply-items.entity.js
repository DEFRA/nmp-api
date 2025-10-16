const { EntitySchema } = require("typeorm");

const SoilNitrogenSupplyItemsEntity = new EntitySchema({
  name: "SoilNitrogenSupplyItems",
  tableName: "SoilNitrogenSupplyItems",
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
    SoilNitrogenSupplyId: {
      type: "int",
      nullable: false,
      name: "SoilNitrogenSupplyId",
    },
  },
  relations: {
    PreviousGrasses: {
      type: "one-to-many",
      target: "PreviousGrasses",
      joinColumn: { name: "ID" },
      inverseSide: "SoilNitrogenSupplyItems",
    },
    PreviousCroppingSoilNitrogenSupply: {
      type: "one-to-many",
      target: "PreviousCroppings",
      joinColumn: { name: "ID" },
      inverseSide: "SoilNitrogenSupplyItems",
    },
  },
});

module.exports = { SoilNitrogenSupplyItemsEntity };
