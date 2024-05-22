export const createNutrientRecommendationnReqBody: any = {
  field: {
    fieldType: 1,
    multipleCrops: false,
    arable: [
      {
        cropGroupId: 5,
        cropTypeId: 110,
        cropInfo1Id: 1,
        cropInfo2Id: null,
        sowingDate: '2024-05-08T06:43:43.355Z',
        expectedYield: 200,
      },
    ],
    grassland: {},
    soil: {
      soilTypeId: 2,
      kReleasingClay: false,
      soilAnalyses: [
        {
          soilAnalysisDate: '2024-05-08T06:43:43.355Z',
          soilpH: 7,
          sulphurDeficient: true,
          snsIndexId: 3,
          pIndexId: 4,
          kIndexId: 5,
          mgIndexId: 5,
          snsMethodologyId: 4,
          pMethodologyId: 0,
          kMethodologyId: 4,
          mgMethodologyId: 4,
        },
      ],
    },
    harvestYear: 2024,
    area: 500,
    postcode: 'SS3 9TJ',
    altitude: 80,
    rainfallAverage: 300,
    excessWinterRainfall: 50,
    organicMaterials: [],
    previousCropping: {
      previousGrassId: 0,
      previousCropGroupId: 0,
      previousCropTypeId: 0,
      snsId: 0,
      smnDepth: 0,
      measuredSmn: 0,
    },
    countryId: 1,
  },
  nutrients: {
    nitrogen: true,
    phosphate: true,
    potash: true,
    magnesium: true,
    sodium: true,
    sulphur: true,
    lime: true,
  },
  totals: true,
  referenceValue: '1-2024',
};
