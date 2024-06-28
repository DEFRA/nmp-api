import { EntityManager } from 'typeorm';

export const truncateAllTables = async (entityManager: EntityManager) => {
  const tableOrder = [
    'RecommendationComments',
    'Recommendations',
    'SoilAnalyses',
    'ExcessRainfalls',
    'ManagementPeriods',
    'FarmManureTypes',
    'Fields',
    'Farms',
    'Organisations',
    'Crops',
    'OrganicManures',
    'ClimateDatabase',
    'ApplicationMethods',
    'IncorporationDelays',
    'IncorporationMethods',
    'ManureGroups',
    'ManureTypes',
    'MoistureTypes',
    'RainTypes',
    'WindSpeeds',
    'users',
    'ApplicationMethodsIncorpMethods',
    'Countries',
    'IncorpMethodsIncorpDelays',
  ];

  for (const tableName of tableOrder) {
    try {
      await entityManager.query(`DELETE FROM ${tableName}`);
    } catch (error) {
      // console.error(`Error deleting data from table ${tableName}:`, error);
    }
  }
};
