const { WarningCodesMapper } = require("../constants/warning-codes-mapper");
const { WarningKeyMapper } = require("../constants/warning-key-mapper");

class GetWarningRulesAndSpService {
  async getEndFebruaryRules(manure, predicates) {
    return [
      {
        sql: "EXEC spWarning_CheckClosedPeriodEndFebruaryManureRate @OrganicManureID=@0",
        predicate: predicates.twelfthSlurry,
        key: WarningKeyMapper.SLURRYMAXRATE,
        code: WarningCodesMapper.MANUREAPPLICATIONLIMITCLOSEFEB201330,
        join: manure,
      },
      {
        sql: "EXEC spWarning_CheckClosedPeriodEndFebruaryPoultryManure @OrganicManureID=@0",
        predicate: predicates.thirteenthPoultry,
        key: WarningKeyMapper.POULTRYMANUREMAXAPPLICATIONRATE,
        code: WarningCodesMapper.MANUREAPPLICATIONLIMITCLOSEFEB201330,
        join: manure,
      },
      {
        sql: "EXEC spWarning_CheckClosedPeriodEndFebruaryPoultryAndSlurryTypesTwentyDays @OrganicManureID=@0",
        predicate: predicates.fourteenthGap,
        key: WarningKeyMapper.ALLOWWEEKSBETWEENSLURRYPOULTRYAPPLICATIONS,
        code: WarningCodesMapper.CLOSEDPERIODORGANICMANURE,
        join: manure,
      },
    ];
  }

  async getFieldLimitRules(manure, predicates) {
    return [
      {
        sql: "EXEC spWarning_CheckOrganicManureNFieldLimitYear @OrganicManureID=@0",
        predicate: predicates.yearlyN,
        key: WarningKeyMapper.ORGANICMANURENFIELDLIMIT,
        code: WarningCodesMapper.FIELDNLIMIT,
        join: manure,
      },
      {
        sql: "EXEC spWarning_CheckOrganicManureNFieldLimitComposts @OrganicManureID=@0",
        predicate: predicates.twoYearCompost,
        key: WarningKeyMapper.ORGANICMANURENFIELDLIMITCOMPOST,
        code: WarningCodesMapper.FIELDNLIMIT,
        join: manure,
      },
      {
        sql: "EXEC spWarning_OrganicManureNFieldLimitCompostsCropTypeSpecific @OrganicManureID=@0",
        predicate: predicates.fourYearCompost,
        key: WarningKeyMapper.ORGANICMANURENFIELDLIMITCOMPOSTMULCH,
        code: WarningCodesMapper.FIELDNLIMIT,
        join: manure,
      },
    ];
  }

  async getNMaxRules(_manure, predicates) {
    return [
      {
        sql: "EXEC spWarning_ComputeNMaxRateCombined @ManureID=@0",
        predicate: predicates.manureNMax,
        key: WarningKeyMapper.NMAXLIMIT,
        code: WarningCodesMapper.NMAXLIMIT,
        join: "FIELD",
        values: (sp) => [sp.ComputedNMaxRate],
      },
    ];
  }

  async getClosedPeriodRules(manure, predicates) {
    return [
      {
        sql: "EXEC spWarning_CheckClosedPeriodOrganicManure @OrganicManureID=@0",
        predicate: predicates.closedPeriod,
        key: WarningKeyMapper.HIGHNORGANICMANURECLOSEDPERIOD,
        code: WarningCodesMapper.CLOSEDPERIODORGANICMANURE,
        join: manure,
      },
      {
        sql: "EXEC spWarning_CheckClosedPeriodOrganicManureExclusion @OrganicManureID=@0",
        predicate: predicates.sixthExclusion,
        key: WarningKeyMapper.HIGHNORGANICMANURECLOSEDPERIODORGANICFARM,
        code: WarningCodesMapper.CLOSEDPERIODORGANICMANURE,
        join: manure,
      },
      {
        sql: "EXEC spWarning_CheckClosedPeriodFebNLimit @OrganicManureID=@0",
        predicate: predicates.seventhFeb,
        key: WarningKeyMapper.HIGHNORGANICMANUREMAXRATE,
        code: WarningCodesMapper.MANUREAPPLICATIONLIMITCLOSEFEB201350,
        join: manure,
      },
      {
        sql: "EXEC spWarning_CheckClosedPeriodTwentyEightDayLimit @OrganicManureId=@0",
        predicate: predicates.eighth28Day,
        key: WarningKeyMapper.HIGHNORGANICMANUREMAXRATEWEEKS,
        code: WarningCodesMapper.MANUREAPPLICATIONLIMITCLOSEFEB201350,
        join: manure,
      },
    ];
  }

  async getCropSpecificClosedPeriodRules(manure, predicates) {
    return [
      {
        sql: "EXEC spWarning_CheckClosedPeriodOctoberGrassLimit @OrganicManureID=@0",
        predicate: predicates.ninthGrass,
        key: WarningKeyMapper.HIGHNORGANICMANUREMAXRATEGRASS,
        code: WarningCodesMapper.MANUREAPPLICATIONLIMITCLOSEFEB201350,
        join: manure,
      },
      {
        sql: "EXEC spWarning_CheckClosedPeriodOctoberWinterOilSeedRapeLimit @OrganicManureID=@0",
        predicate: predicates.tenthOSR,
        key: WarningKeyMapper.HIGHNORGANICMANUREMAXRATEOSR,
        code: WarningCodesMapper.MANUREAPPLICATIONLIMITCLOSEFEB201350,
        join: manure,
      },
      {
        sql: "EXEC spWarning_CheckClosedPeriodOctoberGrassAndWinterOilSeedRape @OrganicManureID=@0",
        predicate: predicates.eleventhDateOnly,
        key: WarningKeyMapper.HIGHNORGANICMANUREDATEONLY,
        code: WarningCodesMapper.CLOSEDPERIODORGANICMANURE,
        join: manure,
      },
    ];
  }

  async getOrganicManureRules(manure, predicates) {
    return [
      ...(await this.getFieldLimitRules(manure, predicates)),
      ...(await this.getNMaxRules(manure, predicates)),
      ...(await this.getClosedPeriodRules(manure, predicates)),
      ...(await this.getCropSpecificClosedPeriodRules(manure, predicates)),
      ...(await this.getEndFebruaryRules(manure, predicates)),
    ];
  }

  async getFertiliserRules(fertiliser, predicates, formatToDayMonth) {
    return [
      {
        sql: "EXEC spWarning_CheckFertiliserClosedPeriodCropRestriction @FertiliserID=@0",
        predicate: predicates.fertClosedPeriodCrop,
        key: WarningKeyMapper.NITROFERTCLOSEDPERIOD,
        code: WarningCodesMapper.CLOSEDPERIODFERTILISER,
        join: fertiliser,
      },
      {
        sql: "EXEC spWarning_CheckFertiliserClosedPeriodNitrogenLimit @FertiliserID=@0",
        predicate: predicates.fertClosedPeriodMaxN,
        key: WarningKeyMapper.INORGNMAXRATE,
        code: WarningCodesMapper.MAXAPPLICATIONRATEINORGFERTCROPCLOSEDSPREADINGPERIOD,
        join: fertiliser,
        values: async (sp) => [
          await formatToDayMonth(sp.ClosedPeriodStartDate),
          await formatToDayMonth(sp.ClosedPeriodEndDate),
          sp.MaxNitrogenRate,
        ],
      },
      {
        sql: "EXEC spWarning_CheckFertiliserClosedPeriodTwentyEightDayLimit @FertiliserID=@0",
        predicate: predicates.fertTwentyEightDay,
        key: WarningKeyMapper.INORGNMAXRATEBRASSICA,
        code: WarningCodesMapper.MAXAPPLICATIONRATEINORGFERTCROPCLOSEDSPREADINGPERIOD,
        join: fertiliser,
        values: async (sp) => [
          await formatToDayMonth(sp.ClosedPeriodStart),
          await formatToDayMonth(sp.ClosedPeriodEnd),
        ],
      },
      {
        sql: "EXEC spWarning_CheckFertiliserClosedPeriodToOctoberLimit @FertiliserID=@0",
        predicate: predicates.fertOctoberLimit,
        key: WarningKeyMapper.INORGNMAXRATEOSR,
        code: WarningCodesMapper.MAXAPPLICATIONRATEINORGFERTCROPCLOSEDSPREADINGPERIOD,
        join: fertiliser,
        values: async (sp) => [await formatToDayMonth(sp.ClosedPeriodStart)],
      },
      {
        sql: "EXEC spWarning_CheckFertiliserClosedPeriodOctoberGrassHighN @FertiliserID=@0",
        predicate: predicates.fertOctoberGrass,
        key: WarningKeyMapper.INORGNMAXRATEGRASS,
        code: WarningCodesMapper.MAXAPPLICATIONRATEINORGFERTCROPCLOSEDSPREADINGPERIOD,
        join: fertiliser,
        values: async (sp) => [await formatToDayMonth(sp.ClosedPeriodStart)],
      },
      {
        sql: "EXEC spWarning_CheckFertiliserClosedPeriodOct31ToClosedPeriod @FertiliserID=@0",
        predicate: predicates.fertOct31,
        key: WarningKeyMapper.INORGFERTDATEONLY,
        code: WarningCodesMapper.CLOSEDPERIODFERTILISER,
        join: fertiliser,
      },
      {
        sql: "EXEC spWarning_ComputeNMaxRateCombined @ManureID=@0",
        predicate: predicates.fertiliserNMax,
        key: WarningKeyMapper.NMAXLIMIT,
        code: WarningCodesMapper.NMAXLIMIT,
        join: "FIELD",
        values: (sp) => [sp.ComputedNMaxRate],
      },
    ];
  }
}

module.exports = { GetWarningRulesAndSpService };
