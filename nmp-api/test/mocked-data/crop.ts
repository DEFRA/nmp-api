export const createCropReqBody = {
  FieldID: null,
  Year: 2023,
  CropTypeID: 110,
  Variety: null,
  OtherCropName: null,
  CropInfo1: 1,
  CropInfo2: null,
  SowingDate: null,
  Yield: null,
  Confirm: true,
  PreviousGrass: null,
  GrassHistory: null,
  Comments: null,
  Establishment: null,
  LivestockType: null,
  MilkYield: 0,
  ConcentrateUse: 0,
  StockingRate: 0,
  DefoliationSequence: null,
  GrazingIntensity: 0,
  PreviousID: null,
  FieldType: 1,
};

export const createPlanReqBody: any = {
  Crops: [
    {
      Crop: {
        Year: 2024,
        CropTypeID: 110,
        Variety: null,
        OtherCropName: null,
        CropInfo1: 1,
        CropInfo2: null,
        SowingDate: null,
        Yield: null,
        Confirm: false,
        PreviousGrass: null,
        GrassHistory: null,
        Comments: null,
        Establishment: null,
        LivestockType: null,
        MilkYield: 0,
        ConcentrateUse: 0,
        StockingRate: 0,
        DefoliationSequence: null,
        GrazingIntensity: 0,
        PreviousID: null,
        FieldID: null,
        FieldType: 1,
      },
      ManagementPeriods: [
        {
          DefoliationID: 0,
          Utilisation1ID: 0,
          Utilisation2ID: 0,
          PloughedDown: '2024-05-13T05:50:39.431Z',
          PreviousID: 0,
        },
      ],
    },
  ],
};

export const createCropWithManagementPeriodReqBody: any = {
  Crop: {
    Year: 0,
    CropTypeID: 0,
    Variety: 'string',
    OtherCropName: 'string',
    CropInfo1: 0,
    CropInfo2: 0,
    SowingDate: '2024-06-04T09:02:36.788Z',
    Yield: 0,
    Confirm: true,
    PreviousGrass: 0,
    GrassHistory: 0,
    Comments: 'string',
    Establishment: 0,
    LivestockType: 0,
    MilkYield: 0,
    ConcentrateUse: 0,
    StockingRate: 0,
    DefoliationSequence: 0,
    GrazingIntensity: 0,
    PreviousID: 0,
    FieldType: 1,
  },
  ManagementPeriods: [
    {
      DefoliationID: 0,
      Utilisation1ID: 0,
      Utilisation2ID: 0,
      PloughedDown: '2024-06-04T09:02:36.788Z',
      PreviousID: 0,
    },
  ],
};
