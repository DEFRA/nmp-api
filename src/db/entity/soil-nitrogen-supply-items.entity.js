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
  
});

module.exports = { SoilNitrogenSupplyItemsEntity };
