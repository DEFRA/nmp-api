export const organicManureReqBody: any = {
  OrganicManures: [
    {
      OrganicManure: {
        ApplicationDate: new Date(),
        Confirm: true,
        N: 10.5,
        P2O5: 5.2,
        K2O: 7.8,
        MgO: 3.4,
        SO3: 1.9,
        AvailableN: 15.7,
        ApplicationRate: 20,
        DryMatterPercent: 65.2,
        UricAcid: 2.3,
        EndOfDrain: new Date(),
        Rainfall: 30,
        AreaSpread: 40.5,
        ManureQuantity: 50.8,
        NH4N: 8.9,
        NO3N: 12.4,
        AvailableP2O5: 6.3,
        AvailableK2O: 9.1,
      },
      FarmID: 1,
      FieldTypeID: 1,
      SaveDefaultForFarm: false,
    },
  ],
};

export const manureTypeData = {
  Name: 'Cattle FYM - Fresh',
  ManureGroupID: null,
  CountryID: null,
  HighReadilyAvailableNitrogen: false,
  IsLiquid: false,
  DryMatter: 25,
  TotalN: 6,
  NH4N: 1.2,
  Uric: 0,
  NO3N: 0,
  P2O5: 3.2,
  K2O: 9.4,
  SO3: 2.4,
  MgO: 1.8,
  P2O5Available: 60,
  K2OAvailable: 90,
  NMaxConstant: 68.3,
  ApplicationRateArable: 30,
  ApplicationRateGrass: 20
};

export const applicationMethodData = {
  Name: 'BroadCast spreader',
  ApplicableForGrass: 'B',
  ApplicableForArableAndHorticulture: 'B'
};

export const incorporationMethodData = {
  Name: 'Shallow injection',
  ApplicableForGrass: null,
  ApplicableForArableAndHorticulture: null
};

export const incorporationDelayData = {
  Name: 'Less than 2 hours',
  FromHours: 0,
  ToHours: 2,
  ApplicableFor: 'A'
};

export const windSpeedData = {
  Name: 'Calm/gentle (0-3 Beaufort scale)',
  FromScale: 0,
  ToScale: 3
};

export const moistureTypeData = {
  Name: 'Dry'
};

export const rainTypeData = {
  Name: 'No rainfall within 6 hours of spreading',
  RainInMM: 0
};

export const countryData = {
  Name: 'England/Wales',
}