const { EntitySchema } = require("typeorm");

const FieldExtensionEntity = new EntitySchema({
  name: "FieldExtension",
  tableName: "FieldExtensions",
  columns: {
    FieldID: { type: "int", primary: true },
    SiteClassID: { type: "int", nullable: true },
    GrassGrowthClassID: { type: "int", nullable: true },
    CreatedOn: {
      type: "datetime2",
      precision: 7,
      default: () => "sysdatetime()",
    },
    ModifiedOn: { type: "datetime2", precision: 7, nullable: true },
  },
});

module.exports = { FieldExtensionEntity };