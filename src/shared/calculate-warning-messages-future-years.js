const {
  ManagementPeriodEntity,
} = require("../db/entity/management-period.entity");
const { CropEntity } = require("../db/entity/crop.entity");
const { FieldEntity } = require("../db/entity/field.entity");
const { FarmEntity } = require("../db/entity/farm.entity");
const { WarningsEntity } = require("../db/entity/warning.entity");
const {
  GetWarningRulesAndSpService,
} = require("./get-warning-rules-sp.service");

class CalculateFutureWarningMessageService {
  /* =====================================================
     COMMON HELPERS
  ===================================================== */

  constructor() {
    this.GetWarningRulesAndSpService = new GetWarningRulesAndSpService();
  }

  async commonWarningMessageCalculator(manager, entity, getRulesFn) {
    const context = await this.loadContext(manager, entity.ManagementPeriodID);
    const warnings = [];

    const rules = await getRulesFn(
      entity,
      this,
      this.formatToDayMonth?.bind(this)
    );

    for (const r of rules) {
      const sp = await this.execSP(manager, r.sql, [entity.ID]);
      if (!sp || !(await r.predicate.call(this, sp))) {
        continue;
      }

      const template = await this.getTemplate(
        manager,
        context.farm.CountryID,
        r.key
      );
      if (!template) {
        continue;
      }

      const localized = await this.bind(
        template,
        r.values ? await r.values(sp) : []
      );

      warnings.push(
        await this.buildMessage({
          field: context.field,
          crop: context.crop,
          joining: r.join === "FIELD" ? context.field : entity,
          localized,
        })
      );
    }

    return warnings;
  }

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
    if (!template || values.length === 0) {
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
      WarningCodeID: replace(template.WarningCodeID),
      WarningLevelID: replace(template.WarningLevelID),
    };
  }

  async buildMessage({ field, crop, joining, localized }) {
    return {
      ID: null,
      FieldID: field.ID,
      CropID: crop.ID,
      JoiningID: joining.ID,
      Header: localized?.Header ?? null,
      Para1: localized?.Para1 ?? null,
      Para2: localized?.Para2 ?? null,
      Para3: localized?.Para3 ?? null,
      WarningCodeID: localized.WarningCodeID ?? null,
      WarningLevelID: localized.WarningLevelID ?? null,
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

  /* =========== ORGANIC MANURE PREDICATES (ASYNC) =============== */

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
    const exceedsNMax = sp.IsCropTypeHasNMax && sp.IsNExceeding;

    const isEngland = sp.IsFieldEngland && sp.IsFieldWithinNVZ;

    const isWales = sp.IsFieldWales;

    return exceedsNMax && (isEngland || isWales);
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
    const commonConditions =
      sp.IsHighRanManures &&
      sp.InsideClosedPeriod &&
      sp.IsRestrictedCropTypeNotExist;

    const englandConditions =
      sp.IsFieldInEngland && sp.IsWithinNVZ && sp.IsFarmRegisteredOrganic;

    const walesConditions = sp.IsFieldInWelsh && sp.IsFarmRegisteredOrganic;

    return (
      (englandConditions && commonConditions) ||
      (walesConditions && commonConditions)
    );
  }

  async seventhFeb(sp) {
    const isEngland = sp.IsFieldInEngland && sp.IsWithinNVZ;
    const isWales = sp.IsFieldInWelsh;

    const commonConditions =
      sp.RegisteredOrganicProducer &&
      sp.IsHighRanManures &&
      sp.InsideClosedPeriodToFeb &&
      sp.IsAllowedCrop &&
      sp.IsTotalClosedPeriodNAboveLimit;

    return (isEngland || isWales) && commonConditions;
  }

  async eighth28Day(sp) {
    const baseField =
      sp.IsFieldInEngland && sp.IsWithinNvz && sp.IsRegisteredOrganicProducer;

    const manureAndPeriod =
      sp.IsHighRanManures &&
      sp.IsInsideClosedPeriodToFebruary &&
      sp.IsCropTypeAllowed;

    const exceedsLimit =
      sp.IsCurrentNitrogenAboveFifty ||
      sp.IsTotalClosedPeriodNitrogenAboveOneHundredFifty ||
      sp.IsPreviousApplicationWithinTwentyEightDays;

    return baseField && manureAndPeriod && exceedsLimit;
  }

  async ninthGrass(sp) {
    const isEnglandGrass =
      sp.IsFieldInEngland && sp.IsWithinNvz && sp.IsGrassCropType;

    const isClosedPeriodOrganic =
      sp.IsRegisteredOrganicProducer &&
      sp.IsHighRanManures &&
      sp.IsInsideClosedPeriodToOctober;

    const exceedsNitrogenLimit =
      sp.IsTotalClosedPeriodNitrogenAboveOneHundredFifty ||
      sp.IsAnyOrganicManureAboveForty;

    return isEnglandGrass && isClosedPeriodOrganic && exceedsNitrogenLimit;
  }

  async tenthOSR(sp) {
    const isEngland = sp.IsFieldInEngland && sp.IsWithinNvz;

    const isEligibleProducer =
      sp.IsRegisteredOrganicProducer && sp.IsHighRanManures;

    const isOctoberOSR =
      sp.IsInsideClosedPeriodToOctober && sp.IsWinterOilSeedRapeCropType;

    const isNitrogenExceeded =
      sp.IsTotalClosedPeriodNitrogenAboveOneHundredFifty;

    return (
      isEngland && isEligibleProducer && isOctoberOSR && isNitrogenExceeded
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
    const isEngland =
      sp.IsFieldInEngland &&
      sp.IsWithinNvz &&
      sp.IsInsideClosedPeriodToFebruary;

    const isWales = sp.IsFieldInWales && sp.IsInsideClosedPeriodToFebruary;

    const common = sp.IsAllowedManureType && sp.IsApplicationRateAboveThirty;

    return (isEngland || isWales) && common;
  }

  async thirteenthPoultry(sp) {
    const commonConditions =
      sp.IsInsideClosedPeriodToFebruary &&
      sp.IsAllowedPoultryManure &&
      sp.IsApplicationRateAboveEight;

    const englandConditions = sp.IsFieldInEngland && sp.IsWithinNvz;

    const walesConditions = sp.IsFieldInWales;

    return (
      (englandConditions && commonConditions) ||
      (walesConditions && commonConditions)
    );
  }

  async fourteenthGap(sp) {
    const isInsideClosedPeriod =
      sp.IsInsideClosedPeriodToFebruary &&
      sp.IsAllowedManureType &&
      sp.IsPreviousApplicationWithinTwentyDays;

    const england =
      sp.IsFieldInEngland && sp.IsWithinNvz && isInsideClosedPeriod;

    const wales = sp.IsFieldInWales && isInsideClosedPeriod;

    return england || wales;
  }

  /* ============ FERTILISER PREDICATES (ASYNC) ============= */

  async fertClosedPeriodCrop(sp) {
    const common = sp.IsApplicationInsideClosedPeriod && sp.IsCropTypeAllowed;

    const england = sp.IsFieldInEngland && sp.IsFieldWithinNVZ && common;

    const wales = sp.IsFieldInWales && common;

    return england || wales;
  }

  async fertClosedPeriodMaxN(sp) {
    const common =
      sp.IsApplicationInsideClosedPeriod &&
      sp.IsAllowedCropType &&
      sp.IsTotalNAboveLimit;

    const england = sp.IsFieldInEngland && sp.IsWithinNVZ;
    const wales = sp.IsFieldInWales;

    return common && (england || wales);
  }

  async fertTwentyEightDay(sp) {
    const englandBase =
      sp.IsFieldInEngland &&
      sp.IsWithinNVZ &&
      sp.IsInsideClosedPeriod &&
      sp.IsCropTypeAllowed;

    const walesBase =
      sp.IsFieldInWales && sp.IsInsideClosedPeriod && sp.IsCropTypeAllowed;

    const nThresholdBreached =
      sp.IsCurrentNAbove50 ||
      sp.IsTotalNAbove100 ||
      sp.IsPreviousApplicationWithin28Days;

    return (englandBase || walesBase) && nThresholdBreached;
  }

  async fertOctoberLimit(sp) {
    const common =
      sp.IsInsideClosedPeriodToOctober &&
      sp.IsCropTypeAllowed &&
      sp.IsTotalNAbove30;

    const england = sp.IsFieldInEngland && sp.IsWithinNVZ && common;
    const wales = sp.IsFieldInWales && common;

    return england || wales;
  }

  async fertOctoberGrass(sp) {
    const common =
      sp.IsGrassCropType &&
      sp.IsInsideClosedPeriodToOctober &&
      (sp.IsCurrentNAbove40 ||
      sp.IsTotalClosedPeriodNAbove80);

    const england = sp.IsFieldInEngland && sp.IsWithinNVZ;
    const wales = sp.IsFieldInWales;

    return common && (england || wales);
  }

  async fertOct31(sp) {
    const isEngland = sp.IsFieldInEngland && sp.IsWithinNVZ;
    const isWales = sp.IsFieldInWales;

    const insidePeriod = sp.IsApplicationInsideOct31ToClosedPeriod;

    const isRelevantCrop = sp.IsGrassCropType || sp.IsWinterOilSeedRapeCropType;

    return insidePeriod && isRelevantCrop && (isEngland || isWales);
  }

  async calculateFertiliserWarningMessage(manager, fertiliser) {
    return this.commonWarningMessageCalculator(
      manager,
      fertiliser,
      this.GetWarningRulesAndSpService.getFertiliserRules.bind(
        this.GetWarningRulesAndSpService
      )
    );
  }

  async calculateOrganicManureWarningMessage(manager, manure) {
    return this.commonWarningMessageCalculator(
      manager,
      manure,
      this.GetWarningRulesAndSpService.getOrganicManureRules.bind(
        this.GetWarningRulesAndSpService
      )
    );
  }
}

module.exports = { CalculateFutureWarningMessageService };
