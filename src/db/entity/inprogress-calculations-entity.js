const { EntitySchema } = require("typeorm");

const InprogressCalculationsEntity = new EntitySchema({
  name: "InprogressCalculations",
  tableName: "InprogressCalculations",
  columns: {
    FieldID: {
      type: "int",
      primary: true, // Part of the composite primary key
      nullable: false,
    },
    Year: {
      type: "int",
      primary: true, // Part of the composite primary key
      nullable: false,
    },
  },
  // Relations can be added here if needed, e.g., many-to-one relationships with other entities
  relations: {
    Field: {
      type: "many-to-one",
      target: "Field", // Assuming a Field entity exists
      joinColumn: { name: "FieldID" },
      inverseSide: "InprogressCalculations",
    },
  },
});

module.exports = { InprogressCalculationsEntity };
