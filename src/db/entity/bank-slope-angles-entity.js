const { EntitySchema } = require("typeorm");

const BankSlopeAnglesEntity = new EntitySchema({
  name: "BankSlopeAngles",
  tableName: "BankSlopeAngles",
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
    Angle: {
      type: "int",
      nullable: false,
      name: "Angle",
    },
    Slope: {
      type: "decimal",
      precision: 18,
      scale: 2,
      nullable: false,
      name: "Slope",
    },
  },
});

module.exports = { BankSlopeAnglesEntity };
