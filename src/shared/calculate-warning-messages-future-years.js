const {
  ManagementPeriodEntity,
} = require("../db/entity/management-period.entity");
const { CropEntity } = require("../db/entity/crop.entity");
const { FieldEntity } = require("../db/entity/field.entity");
const { FarmEntity } = require("../db/entity/farm.entity");
const { WarningsEntity } = require("../db/entity/warning.entity");

const { WarningKeyMapper } = require("../constants/warning-key-mapper");
const { WarningCodesMapper } = require("../constants/warning-codes-mapper");
const { WarningLevelMapper } = require("../constants/warning-levels-mapper");

class CalculateFutureWarningMessageService {
  /* =====================================================
     COMMON HELPERS
  ===================================================== */
  constructor (){}

  async loadContext(manager, managementPeriodId) {
    const mp = await manager.findOne(ManagementPeriodEntity, {
      where: { ID: managementPeriodId },
    });

    const crop = await manager.findOne(CropEntity, {
      where: { ID: mp.CropID },
    });

    const field = await manager.findOne(FieldEntity, {
      where: { ID: crop.FieldID },
    });

    const farm = await manager.findOne(FarmEntity, {
      where: { ID: field.FarmID },
    });

    return { mp, crop, field, farm };
  }

  async execSP(manager, sql, params) {
    const result = await manager.query(sql, params);
    return result?.[0] ?? null;
  }

  async getTemplate(manager, countryId, key) {
    return manager.findOne(WarningsEntity, {
      where: { CountryID: countryId, WarningKey: key },
    });
  }

  async bind(template, values = []) {
    if (!template || values.length === 0)
        {
        return template;
        } 

    const replace = (text) =>
      typeof text === "string"
        ? values.reduce(
            (acc, v, i) => acc.split(`{${i}}`).join(String(v)),
            text
          )
        : text;

    return {
      Header: replace(template.Header),
      Para1: replace(template.Para1),
      Para2: replace(template.Para2),
      Para3: replace(template.Para3),
    };
  }

  async buildMessage({ field, crop, joining, localized, code, level }) {
    return {
      ID: null,
      FieldID: field.ID,
      CropID: crop.ID,
      JoiningID: joining.ID,
      Header: localized?.Header ?? null,
      Para1: localized?.Para1 ?? null,
      Para2: localized?.Para2 ?? null,
      Para3: localized?.Para3 ?? null,
      WarningCodeID: code,
      WarningLevelID: level,
    };
  }

  async formatToDayMonth(date) {
    if (!date) {
      return "";
    }
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
    });
  }

  /* =====================================================
     ORGANIC MANURE PREDICATES (ASYNC)
  ===================================================== */

  async yearlyN(sp) {
    return (
      (sp.IsFieldEngland && sp.IsWithinNvz && sp.IsOrganicManureNFieldLimit) ||
      (sp.IsFieldWelsh && sp.IsOrganicManureNFieldLimit)
    );
  }

  async twoYearCompost(sp) {
    const c =
      sp.IsGreenCompost &&
      sp.IsRestrictedCropNotPresent &&
      sp.IsTotalNitrogenAboveLimit;
    return (
      (sp.IsFieldEngland && sp.IsFieldWithinNvz && c) || (sp.IsFieldWelsh && c)
    );
  }

  async fourYearCompost(sp) {
    const c = sp.IsGreenCompost && sp.IsAllowedCrops && sp.IsTotalNAboveLimit;

    return (
      (sp.IsFieldInEngland && sp.IsFieldWithinNVZ && c) ||
      (sp.IsFieldInWelsh && c)
    );
  }

  async manureNMax(sp) {
    return (
      (sp.IsFieldEngland &&
        sp.IsFieldWithinNVZ &&
        sp.IsCropTypeHasNMax &&
        sp.IsNExceeding) ||
      (sp.IsFieldWales && sp.IsCropTypeHasNMax && sp.IsNExceeding)
    );
  }

  async closedPeriod(sp) {
    return (
      !sp.RegisteredOrganicProducer &&
      sp.IsHighRanManures &&
      sp.IsWithinClosedPeriod &&
      (sp.IsFieldInEngland || sp.IsFieldInWelsh)
    );
  }

  async sixthExclusion(sp) {
    return (
      (sp.IsFieldInEngland &&
        sp.IsWithinNVZ &&
        sp.IsFarmRegisteredOrganic &&
        sp.IsHighRanManures &&
        sp.InsideClosedPeriod &&
        sp.IsRestrictedCropTypeNotExist) ||
      (sp.IsFieldInWelsh &&
        !sp.IsFarmRegisteredOrganic &&
        sp.IsHighRanManures &&
        sp.InsideClosedPeriod &&
        sp.IsRestrictedCropTypeNotExist)
    );
  }

  async seventhFeb(sp) {
    return (
      (sp.IsFieldInEngland &&
        sp.IsWithinNVZ &&
        sp.RegisteredOrganicProducer &&
        sp.IsHighRanManures &&
        sp.InsideClosedPeriodToFeb &&
        sp.IsAllowedCrop &&
        sp.IsTotalClosedPeriodNAboveLimit) ||
      (sp.IsFieldInWelsh &&
        !sp.RegisteredOrganicProducer &&
        sp.IsHighRanManures &&
        sp.InsideClosedPeriodToFeb &&
        sp.IsAllowedCrop &&
        sp.IsTotalClosedPeriodNAboveLimit)
    );
  }

  async eighth28Day(sp) {
    return (
      sp.IsFieldInEngland &&
      sp.IsWithinNvz &&
      sp.IsRegisteredOrganicProducer &&
      sp.IsHighRanManures &&
      sp.IsInsideClosedPeriodToFebruary &&
      sp.IsCropTypeAllowed &&
      (sp.IsCurrentNitrogenAboveFifty ||
        sp.IsTotalClosedPeriodNitrogenAboveOneHundredFifty ||
        sp.IsPreviousApplicationWithinTwentyEightDays)
    );
  }

  async ninthGrass(sp) {
    return (
      sp.IsFieldInEngland &&
      sp.IsWithinNvz &&
      sp.IsRegisteredOrganicProducer &&
      sp.IsHighRanManures &&
      sp.IsInsideClosedPeriodToOctober &&
      sp.IsGrassCropType &&
      (sp.IsTotalClosedPeriodNitrogenAboveOneHundredFifty ||
        sp.IsAnyOrganicManureAboveForty)
    );
  }

  async tenthOSR(sp) {
    return (
      sp.IsFieldInEngland &&
      sp.IsWithinNvz &&
      sp.IsRegisteredOrganicProducer &&
      sp.IsHighRanManures &&
      sp.IsInsideClosedPeriodToOctober &&
      sp.IsWinterOilSeedRapeCropType &&
      sp.IsTotalClosedPeriodNitrogenAboveOneHundredFifty
    );
  }

  async eleventhDateOnly(sp) {
    return (
      sp.IsFieldInEngland &&
      sp.IsWithinNvz &&
      sp.IsHighRanManures &&
      sp.IsInsideClosedPeriodToOctober &&
      (sp.IsGrassCropType || sp.IsWinterOilSeedRapeCropType)
    );
  }

  async twelfthSlurry(sp) {
    return (
      (sp.IsFieldInEngland &&
        sp.IsWithinNvz &&
        sp.IsInsideClosedPeriodToFebruary &&
        sp.IsAllowedManureType &&
        sp.IsApplicationRateAboveThirty) ||
      (sp.IsFieldInWales &&
        sp.IsInsideClosedPeriodToFebruary &&
        sp.IsAllowedManureType &&
        sp.IsApplicationRateAboveThirty)
    );
  }

  async thirteenthPoultry(sp) {
    return (
      (sp.IsFieldInEngland &&
        sp.IsWithinNvz &&
        sp.IsInsideClosedPeriodToFebruary &&
        sp.IsAllowedPoultryManure &&
        sp.IsApplicationRateAboveEight) ||
      (sp.IsFieldInWales &&
        sp.IsInsideClosedPeriodToFebruary &&
        sp.IsAllowedPoultryManure &&
        sp.IsApplicationRateAboveEight)
    );
  }

  async fourteenthGap(sp) {
    return (
      (sp.IsFieldInEngland &&
        sp.IsWithinNvz &&
        sp.IsInsideClosedPeriodToFebruary &&
        sp.IsAllowedManureType &&
        sp.IsPreviousApplicationWithinTwentyDays) ||
      (sp.IsFieldInWales &&
        sp.IsInsideClosedPeriodToFebruary &&
        sp.IsAllowedManureType &&
        sp.IsPreviousApplicationWithinTwentyDays)
    );
  }

  /* =====================================================
     FERTILISER PREDICATES (ASYNC)
  ===================================================== */

  async fertClosedPeriodCrop(sp) {
    return (
      (sp.IsFieldInEngland &&
        sp.IsFieldWithinNVZ &&
        sp.IsApplicationInsideClosedPeriod &&
        sp.IsCropTypeAllowed) ||
      (sp.IsFieldInWales &&
        sp.IsApplicationInsideClosedPeriod &&
        sp.IsCropTypeAllowed)
    );
  }

  async fertClosedPeriodMaxN(sp) {
    return (
      (sp.IsFieldInEngland &&
        sp.IsWithinNVZ &&
        sp.IsApplicationInsideClosedPeriod &&
        sp.IsAllowedCropType &&
        sp.IsTotalNAboveLimit) ||
      (sp.IsFieldInWales &&
        sp.IsApplicationInsideClosedPeriod &&
        sp.IsAllowedCropType &&
        sp.IsTotalNAboveLimit)
    );
  }

  async fertTwentyEightDay(sp) {
    return (
      (sp.IsFieldInEngland &&
        sp.IsWithinNVZ &&
        sp.IsInsideClosedPeriod &&
        sp.IsCropTypeAllowed &&
        (sp.IsCurrentNAbove50 ||
          sp.IsTotalNAbove100 ||
          sp.IsPreviousApplicationWithin28Days)) ||
      (sp.IsFieldInWales &&
        sp.IsInsideClosedPeriod &&
        sp.IsCropTypeAllowed &&
        (sp.IsCurrentNAbove50 ||
          sp.IsTotalNAbove100 ||
          sp.IsPreviousApplicationWithin28Days))
    );
  }

  async fertOctoberLimit(sp) {
    return (
      (sp.IsFieldInEngland &&
        sp.IsWithinNVZ &&
        sp.IsInsideClosedPeriodToOctober &&
        sp.IsCropTypeAllowed &&
        sp.IsTotalNAbove30) ||
      (sp.IsFieldInWales &&
        sp.IsInsideClosedPeriodToOctober &&
        sp.IsCropTypeAllowed &&
        sp.IsTotalNAbove30)
    );
  }

  async fertOctoberGrass(sp) {
    return (
      (sp.IsFieldInEngland &&
        sp.IsWithinNVZ &&
        sp.IsGrassCropType &&
        sp.IsInsideClosedPeriodToOctober &&
        sp.IsCurrentNAbove40 &&
        sp.IsTotalClosedPeriodNAbove80) ||
      (sp.IsFieldInWales &&
        sp.IsGrassCropType &&
        sp.IsInsideClosedPeriodToOctober &&
        sp.IsCurrentNAbove40 &&
        sp.IsTotalClosedPeriodNAbove80)
    );
  }

  async fertOct31(sp) {
    return (
      (sp.IsFieldInEngland &&
        sp.IsWithinNVZ &&
        sp.IsApplicationInsideOct31ToClosedPeriod &&
        (sp.IsGrassCropType || sp.IsWinterOilSeedRapeCropType)) ||
      (sp.IsFieldInWales &&
        sp.IsApplicationInsideOct31ToClosedPeriod &&
        (sp.IsGrassCropType || sp.IsWinterOilSeedRapeCropType))
    );
  }

  async fertiliserNMax(sp) {
    return (
      (sp.IsFieldEngland &&
        sp.IsFieldWithinNVZ &&
        sp.IsCropTypeHasNMax &&
        sp.IsNExceeding) ||
      (sp.IsFieldWales && sp.IsCropTypeHasNMax && sp.IsNExceeding)
    );
  }

  /* =====================================================
     ORGANIC MANURE EXECUTION
  ===================================================== */

  async calculateOrganicManureWarningMessage(manager, manure) {
    const context = await this.loadContext(manager, manure.ManagementPeriodID);
    const warnings = [];

    const rules = [
      {
        sql: "EXEC spWarning_CheckOrganicManureNFieldLimitYear @OrganicManureID=@0",
        predicate: this.yearlyN,
        key: WarningKeyMapper.ORGANICMANURENFIELDLIMIT,
        code: WarningCodesMapper.FIELDNLIMIT,
        join: manure,
      },
      {
        sql: "EXEC spWarning_CheckOrganicManureNFieldLimitComposts @OrganicManureID=@0",
        predicate: this.twoYearCompost,
        key: WarningKeyMapper.ORGANICMANURENFIELDLIMITCOMPOST,
        code: WarningCodesMapper.FIELDNLIMIT,
        join: manure,
      },
      {
        sql: "EXEC spWarning_OrganicManureNFieldLimitCompostsCropTypeSpecific @OrganicManureID=@0",
        predicate: this.fourYearCompost,
        key: WarningKeyMapper.ORGANICMANURENFIELDLIMITCOMPOSTMULCH,
        code: WarningCodesMapper.FIELDNLIMIT,
        join: manure,
      },
      {
        sql: "EXEC spWarning_ComputeNMaxRateCombined @ManureID=@0",
        predicate: this.manureNMax,
        key: WarningKeyMapper.NMAXLIMIT,
        code: WarningCodesMapper.NMAXLIMIT,
        join: "FIELD",
        values: async (sp) => [sp.ComputedNMaxRate],
      },
      {
        sql: "EXEC spWarning_CheckClosedPeriodOrganicManure @OrganicManureID=@0",
        predicate: this.closedPeriod,
        key: WarningKeyMapper.HIGHNORGANICMANURECLOSEDPERIOD,
        code: WarningCodesMapper.CLOSEDPERIODORGANICMANURE,
        join: manure,
      },
      {
        sql: "EXEC spWarning_CheckClosedPeriodOrganicManureExclusion @OrganicManureID=@0",
        predicate: this.sixthExclusion,
        key: WarningKeyMapper.HIGHNORGANICMANURECLOSEDPERIODORGANICFARM,
        code: WarningCodesMapper.CLOSEDPERIODORGANICMANURE,
        join: manure,
      },
      {
        sql: "EXEC spWarning_CheckClosedPeriodFebNLimit @OrganicManureID=@0",
        predicate: this.seventhFeb,
        key: WarningKeyMapper.HIGHNORGANICMANUREMAXRATE,
        code: WarningCodesMapper.MANUREAPPLICATIONLIMITCLOSEFEB201350,
        join: manure,
      },
      {
        sql: "EXEC spWarning_CheckClosedPeriodTwentyEightDayLimit @OrganicManureId=@0",
        predicate: this.eighth28Day,
        key: WarningKeyMapper.HIGHNORGANICMANUREMAXRATEWEEKS,
        code: WarningCodesMapper.MANUREAPPLICATIONLIMITCLOSEFEB201350,
        join: manure,
      },
      {
        sql: "EXEC spWarning_CheckClosedPeriodOctoberGrassLimit @OrganicManureID=@0",
        predicate: this.ninthGrass,
        key: WarningKeyMapper.HIGHNORGANICMANUREMAXRATEGRASS,
        code: WarningCodesMapper.MANUREAPPLICATIONLIMITCLOSEFEB201350,
        join: manure,
      },
      {
        sql: "EXEC spWarning_CheckClosedPeriodOctoberWinterOilSeedRapeLimit @OrganicManureID=@0",
        predicate: this.tenthOSR,
        key: WarningKeyMapper.HIGHNORGANICMANUREMAXRATEOSR,
        code: WarningCodesMapper.MANUREAPPLICATIONLIMITCLOSEFEB201350,
        join: manure,
      },
      {
        sql: "EXEC spWarning_CheckClosedPeriodOctoberGrassAndWinterOilSeedRape @OrganicManureID=@0",
        predicate: this.eleventhDateOnly,
        key: WarningKeyMapper.HIGHNORGANICMANUREDATEONLY,
        code: WarningCodesMapper.CLOSEDPERIODORGANICMANURE,
        join: manure,
      },
      {
        sql: "EXEC spWarning_CheckClosedPeriodEndFebruaryManureRate @OrganicManureID=@0",
        predicate: this.twelfthSlurry,
        key: WarningKeyMapper.SLURRYMAXRATE,
        code: WarningCodesMapper.MANUREAPPLICATIONLIMITCLOSEFEB201330,
        join: manure,
      },
      {
        sql: "EXEC spWarning_CheckClosedPeriodEndFebruaryPoultryManure @OrganicManureID=@0",
        predicate: this.thirteenthPoultry,
        key: WarningKeyMapper.POULTRYMANUREMAXAPPLICATIONRATE,
        code: WarningCodesMapper.MANUREAPPLICATIONLIMITCLOSEFEB201330,
        join: manure,
      },
      {
        sql: "EXEC spWarning_CheckClosedPeriodEndFebruaryPoultryAndSlurryTypesTwentyDays @OrganicManureID=@0",
        predicate: this.fourteenthGap,
        key: WarningKeyMapper.ALLOWWEEKSBETWEENSLURRYPOULTRYAPPLICATIONS,
        code: WarningCodesMapper.CLOSEDPERIODORGANICMANURE,
        join: manure,
      },
    ];

    for (const r of rules) {
      const sp = await this.execSP(manager, r.sql, [manure.ID]);
      if (!sp || !(await r.predicate.call(this, sp))) continue;

      const template = await this.getTemplate(
        manager,
        context.farm.CountryID,
        r.key
      );
      if (!template) continue;

      const localized = await this.bind(
        template,
        r.values ? await r.values(sp) : []
      );

      warnings.push(
       await this.buildMessage({
          field: context.field,
          crop: context.crop,
          joining: r.join === "FIELD" ? context.field : manure,
          localized,
          code: r.code,
          level: WarningLevelMapper.MANURE,
        })
      );
    }

    return warnings;
  }

  /* =====================================================
     FERTILISER EXECUTION
  ===================================================== */

  async calculateFertiliserWarningMessage(manager, fertiliser) {
    const context = await this.loadContext(
      manager,
      fertiliser.ManagementPeriodID
    );
    const warnings = [];

    const rules = [
      {
        sql: "EXEC spWarning_CheckFertiliserClosedPeriodCropRestriction @FertiliserID=@0",
        predicate: this.fertClosedPeriodCrop,
        key: WarningKeyMapper.NITROFERTCLOSEDPERIOD,
        code: WarningCodesMapper.CLOSEDPERIODFERTILISER,
        join: fertiliser,
      },
      {
        sql: "EXEC spWarning_CheckFertiliserClosedPeriodNitrogenLimit @FertiliserID=@0",
        predicate: this.fertClosedPeriodMaxN,
        key: WarningKeyMapper.INORGNMAXRATE,
        code: WarningCodesMapper.MAXAPPLICATIONRATEINORGFERTCROPCLOSEDSPREADINGPERIOD,
        join: fertiliser,
        values: async (sp) => [
          await this.formatToDayMonth(sp.ClosedPeriodStartDate),
          await this.formatToDayMonth(sp.ClosedPeriodEndDate),
          sp.MaxNitrogenRate,
        ],
      },
      {
        sql: "EXEC spWarning_CheckFertiliserClosedPeriodTwentyEightDayLimit @FertiliserID=@0",
        predicate: this.fertTwentyEightDay,
        key: WarningKeyMapper.INORGNMAXRATEBRASSICA,
        code: WarningCodesMapper.MAXAPPLICATIONRATEINORGFERTCROPCLOSEDSPREADINGPERIOD,
        join: fertiliser,
        values: async (sp) => [
          await this.formatToDayMonth(sp.ClosedPeriodStart),
          await this.formatToDayMonth(sp.ClosedPeriodEnd),
        ],
      },
      {
        sql: "EXEC spWarning_CheckFertiliserClosedPeriodToOctoberLimit @FertiliserID=@0",
        predicate: this.fertOctoberLimit,
        key: WarningKeyMapper.INORGNMAXRATEOSR,
        code: WarningCodesMapper.MAXAPPLICATIONRATEINORGFERTCROPCLOSEDSPREADINGPERIOD,
        join: fertiliser,
        values: async (sp) => [
          await this.formatToDayMonth(sp.ClosedPeriodStart),
        ],
      },
      {
        sql: "EXEC spWarning_CheckFertiliserClosedPeriodOctoberGrassHighN @FertiliserID=@0",
        predicate: this.fertOctoberGrass,
        key: WarningKeyMapper.INORGNMAXRATEGRASS,
        code: WarningCodesMapper.MAXAPPLICATIONRATEINORGFERTCROPCLOSEDSPREADINGPERIOD,
        join: fertiliser,
        values: async (sp) => [
          await this.formatToDayMonth(sp.ClosedPeriodStart),
        ],
      },
      {
        sql: "EXEC spWarning_CheckFertiliserClosedPeriodOct31ToClosedPeriod @FertiliserID=@0",
        predicate: this.fertOct31,
        key: WarningKeyMapper.INORGFERTDATEONLY,
        code: WarningCodesMapper.CLOSEDPERIODFERTILISER,
        join: fertiliser,
      },
      {
        sql: "EXEC spWarning_ComputeNMaxRateCombined @ManureID=@0",
        predicate: this.fertiliserNMax,
        key: WarningKeyMapper.NMAXLIMIT,
        code: WarningCodesMapper.NMAXLIMIT,
        join: "FIELD",
        values: async (sp) => [sp.ComputedNMaxRate],
      },
    ];

    for (const r of rules) {
      const sp = await this.execSP(manager, r.sql, [fertiliser.ID]);
      if (!sp || !(await r.predicate.call(this, sp))) continue;

      const template = await this.getTemplate(
        manager,
        context.farm.CountryID,
        r.key
      );
      if (!template) continue;

      const localized = await this.bind(
        template,
        r.values ? await r.values(sp) : []
      );

      warnings.push(
      await this.buildMessage({
          field: context.field,
          crop: context.crop,
          joining: r.join === "FIELD" ? context.field : fertiliser,
          localized,
          code: r.code,
          level: WarningLevelMapper.FERTILISER,
        })
      );
    }

    return warnings;
  }
}

module.exports = { CalculateFutureWarningMessageService };
