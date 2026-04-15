export const auditColumns = {
  CreatedOn: {
    type: "datetime2",
    precision: 7,
    default: () => "GETDATE()",
  },

  CreatedByID: {
    type: "int",
    nullable: true,
  },

  ModifiedOn: {
    type: "datetime2",
    precision: 7,
    default: () => "GETDATE()",
  },

  ModifiedByID: {
    type: "int",
    nullable: true,
  },
};
