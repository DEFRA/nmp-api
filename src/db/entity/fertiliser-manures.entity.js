const { EntitySchema } = require('typeorm');


const FertiliserManuresEntity = new EntitySchema({
    name: 'FertiliserManures',
    tableName: 'FertiliserManures',
    columns: {
        ID: {
            type: 'int',
            primary: true,
            generated: true,
            generatedIdentity: 'ALWAYS',
            primaryKeyConstraintName: 'PK_FertiliserManures',
        },
        ManagementPeriodID: {
            type: 'int',
        },
        ApplicationDate: {
            type: 'datetime',
        },
        ApplicationRate: {
            type: 'int',
        },
        Confirm: {
            type: 'bit',
            nullable: true,
        },
        N: {
            type: 'decimal',
            precision: 18,
            scale: 3,
        },
        P2O5: {
            type: 'decimal',
            precision: 18,
            scale: 3,
        },
        K2O: {
            type: 'decimal',
            precision: 18,
            scale: 3,
        },
        MgO: {
            type: 'decimal',
            precision: 18,
            scale: 3,
        },
        SO3: {
            type: 'decimal',
            precision: 18,
            scale: 3,
        },
        Na2O: {
            type: 'decimal',
            precision: 18,
            scale: 3,
        },
        NFertAnalysisPercent: {
            type: 'decimal',
            precision: 18,
            scale: 3,
        },
        P2O5FertAnalysisPercent: {
            type: 'decimal',
            precision: 18,
            scale: 3,
        },
        K2OFertAnalysisPercent: {
            type: 'decimal',
            precision: 18,
            scale: 3,
        },
        MgOFertAnalysisPercent: {
            type: 'decimal',
            precision: 18,
            scale: 3,
        },
        SO3FertAnalysisPercent: {
            type: 'decimal',
            precision: 18,
            scale: 3,
        },
        Na2OFertAnalysisPercent: {
            type: 'decimal',
            precision: 18,
            scale: 3,
        },
        Lime: {
            type: 'decimal',
            precision: 18,
            scale: 3,
        },
        NH4N: {
            type: 'decimal',
            precision: 18,
            scale: 3,
        },
        NO3N: {
            type: 'decimal',
            precision: 18,
            scale: 3,
        },
        CreatedOn: {
            type: 'datetime2',
            nullable: true,
            default: () => 'CURRENT_TIMESTAMP',
        },
        CreatedByID: {
            type: 'int',
            nullable: true,
            default: 0,
        },
        ModifiedOn: {
            type: 'datetime2',
            nullable: true,
            default: () => 'CURRENT_TIMESTAMP',
        },
        ModifiedByID: {
            type: 'int',
            nullable: true,
            default: 0,
        },
    },
    relations: {
        ManagementPeriod: {
            type: 'many-to-one',
            target: 'ManagementPeriod',
            joinColumn: { name: 'ManagementPeriodID' },
            inverseSide: 'FertiliserManures',
        },
        CreatedByUser: {
            type: 'many-to-one',
            target: 'User',
            joinColumn: { name: 'CreatedByID' },
            inverseSide: 'CreatedFertiliserManures',
        },
        ModifiedByUser: {
            type: 'many-to-one',
            target: 'User',
            joinColumn: { name: 'ModifiedByID' },
            inverseSide: 'ModifiedFertiliserManures',
        },
    },
});

module.exports = { FertiliserManuresEntity };
