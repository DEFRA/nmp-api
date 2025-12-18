const { OrganicManureEntity } = require("../db/entity/organic-manure.entity");
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
const { CountryMapper } = require("../constants/country-mapper");

class CalculateWarningMessageService {
  constructor() {}

  async bindNumberedPlaceholders(localizedObj, valuesArray) {
    if (!localizedObj) {
      return localizedObj;
    }
    const cloned = { ...localizedObj };

    const replaceInString = (text) => {
      if (typeof text !== "string") {
        return text;
      }
      let updated = text;
      valuesArray.forEach((value, idx) => {
        updated = updated.split(`{${idx}}`).join(String(value));
      });
      return updated;
    };

    cloned.Header = replaceInString(cloned.Header);
    cloned.Para1 = replaceInString(cloned.Para1);
    cloned.Para2 = replaceInString(cloned.Para2);
    cloned.Para3 = replaceInString(cloned.Para3);

    return cloned;
  }

  async createWarningMessage(
    fieldId,
    cropId,
    joining,
    localized,
    warningCode,
    warningLevel
  ) {
    return {
      ID: null,
      FieldID: fieldId,
      CropID: cropId,
      JoiningID: joining.ID,
      Header: localized?.Header ?? null,
      Para1: localized?.Para1 ?? null,
      Para2: localized?.Para2 ?? null,
      Para3: localized?.Para3 ?? null,
      WarningCodeID: warningCode,
      WarningLevelID: warningLevel,
      CreatedOn: null,
      CreatedByID: null,
      ModifiedOn: null,
      ModifiedByID: null,
      PreviousID: null,
    };
  }

  async buildLocalizedWarning(template, dynamicValues = []) {
    if (!template) {
      return null;
    }

    const baseLocalized = {
      Header: template.Header,
      Para1: template.Para1,
      Para2: template.Para2,
      Para3: template.Para3,
    };

    // No dynamic values → return as-is
    if (!Array.isArray(dynamicValues) || dynamicValues.length === 0) {
      return baseLocalized;
    }

    // Bind placeholders
    return this.bindNumberedPlaceholders(baseLocalized, dynamicValues);
  }

  async executeWarningSP(transactionalManager, spQuery, params = []) {
    const result = await transactionalManager.query(spQuery, params);
    return result?.[0] ?? null;
  }

  async getWarningTemplate(transactionalManager, countryId, warningKey) {
    return transactionalManager.findOne(WarningsEntity, {
      where: {
        CountryID: countryId,
        WarningKey: warningKey,
      },
    });
  }

  async isEnglandOrWales({ isEngland, isWales }) {
    return isEngland || isWales;
  }

  async isYearlyNLimitBreached(sp) {
    const common = sp.IsOrganicManureNFieldLimit;

    return this.isEnglandOrWales({
      isEngland: sp.IsFieldEngland && sp.IsWithinNvz && common,
      isWales: sp.IsFieldWelsh && common,
    });
  }

  async isTwoYearCompostLimitBreached(sp) {
    const common =
      sp.IsGreenCompost &&
      sp.IsRestrictedCropNotPresent &&
      sp.IsTotalNitrogenAboveLimit;

    return this.isEnglandOrWales({
      isEngland: sp.IsFieldEngland && sp.IsFieldWithinNvz && common,
      isWales: sp.IsFieldWelsh && common,
    });
  }

  async isFourYearCompostCropLimitBreached(sp) {
    const common =
      sp.IsGreenCompost && sp.IsAllowedCrops && sp.IsTotalNAboveLimit;

    return this.isEnglandOrWales({
      isEngland: sp.IsFieldInEngland && sp.IsFieldWithinNVZ && common,
      isWales: sp.IsFieldInWelsh && common,
    });
  }

  async isNMaxLimitBreached(sp) {
    const common = sp.IsCropTypeHasNMax && sp.IsNExceeding;

    return this.isEnglandOrWales({
      isEngland: sp.IsFieldEngland && sp.IsFieldWithinNVZ && common,
      isWales: sp.IsFieldWales && common,
    });
  }

  async isClosedPeriodOrganicManureBreached(sp) {
    const common =
      !sp.RegisteredOrganicProducer &&
      sp.IsHighRanManures &&
      sp.IsWithinClosedPeriod;

    return this.isEnglandOrWales({
      isEngland: sp.IsFieldInEngland && common,
      isWales: sp.IsFieldInWelsh && common,
    });
  }

  async calculateOrganicManureWarningMessage(
    transactionalManager,
    organicManure
  ) {
    const warningMessages = [];

    // ----------------------------------------------------------------------
    // LOAD MANAGEMENT PERIOD, CROP, FIELD, FARM
    // ----------------------------------------------------------------------
    const managementPeriod = await transactionalManager.findOne(
      ManagementPeriodEntity,
      { where: { ID: organicManure.ManagementPeriodID } }
    );

    const crop = await transactionalManager.findOne(CropEntity, {
      where: { ID: managementPeriod.CropID },
    });

    const field = await transactionalManager.findOne(FieldEntity, {
      where: { ID: crop.FieldID },
    });

    const farm = await transactionalManager.findOne(FarmEntity, {
      where: { ID: field.FarmID },
    });

    // ======================================================================
    // 1️⃣ FIRST WARNING — Yearly N limit (250 limit)
    // ======================================================================

    const spNFieldLimit = await this.executeWarningSP(
      transactionalManager,
      "EXEC spWarning_CheckOrganicManureNFieldLimitYear @OrganicManureID = @0",
      [organicManure.ID]
    );

    const isNLimitEngOrWales = await this.isYearlyNLimitBreached(spNFieldLimit);

    if (isNLimitEngOrWales) {
      const template = await this.getWarningTemplate(
        transactionalManager,
        farm.CountryID,
        WarningKeyMapper.ORGANICMANURENFIELDLIMIT
      );

      const buildLocalizedWarning = await this.buildLocalizedWarning(template);

      warningMessages.push(
        await this.createWarningMessage(
          field.ID,
          crop.ID,
          organicManure,
          buildLocalizedWarning,
          WarningCodesMapper.FIELDNLIMIT,
          WarningLevelMapper.MANURE
        )
      );
    }

    // ======================================================================
    // 2️⃣ SECOND WARNING — 2-year compost limit (Green compost)
    // ======================================================================

    const spNFieldLimitCompost = await this.executeWarningSP(
      transactionalManager,
      "EXEC spWarning_CheckOrganicManureNFieldLimitComposts @OrganicManureID = @0",
      [organicManure.ID]
    );

    const isNCompostEngOrWales = await this.isTwoYearCompostLimitBreached(
      spNFieldLimitCompost
    );

    if (isNCompostEngOrWales) {
      const template = await this.getWarningTemplate(
        transactionalManager,
        farm.CountryID,
        WarningKeyMapper.ORGANICMANURENFIELDLIMITCOMPOST
      );

      const buildLocalizedWarning = await this.buildLocalizedWarning(template);

      warningMessages.push(
        await this.createWarningMessage(
          field.ID,
          crop.ID,
          organicManure,
          buildLocalizedWarning,
          WarningCodesMapper.FIELDNLIMIT,
          WarningLevelMapper.MANURE
        )
      );
    }

    // ======================================================================
    // 3️⃣ THIRD WARNING — 4-year compost for specific crops
    // ======================================================================

    const spNFieldCompostsCropTypeSpecific = await this.executeWarningSP(
      transactionalManager,
      "EXEC spWarning_OrganicManureNFieldLimitCompostsCropTypeSpecific @OrganicManureID = @0 ",
      [organicManure.ID]
    );

    const isSpecificCropsEngOrWale =
      await this.isFourYearCompostCropLimitBreached(
        spNFieldCompostsCropTypeSpecific
      );

    if (isSpecificCropsEngOrWale) {
      const template = await this.getWarningTemplate(
        transactionalManager,
        farm.CountryID,
        WarningKeyMapper.ORGANICMANURENFIELDLIMITCOMPOSTMULCH
      );

      const buildLocalizedWarning = await this.buildLocalizedWarning(template);

      warningMessages.push(
        await this.createWarningMessage(
          field.ID,
          crop.ID,
          organicManure,
          buildLocalizedWarning,
          WarningCodesMapper.FIELDNLIMIT,
          WarningLevelMapper.MANURE
        )
      );
    }

    // ======================================================================
    // 4️⃣ FOURTH WARNING — NMax computation (Combined Organic + Fertiliser)
    // ======================================================================

    const spNMaxManure = await this.executeWarningSP(
      transactionalManager,
      "EXEC spWarning_ComputeNMaxRateCombined @ManureID = @0",
      [organicManure.ID]
    );
    const isNMaxLimitEngOrWale = await this.isNMaxLimitBreached(spNMaxManure);
    if (isNMaxLimitEngOrWale) {
      const template = await this.getWarningTemplate(
        transactionalManager,
        farm.CountryID,
        WarningKeyMapper.NMAXLIMIT
      );

      const buildLocalizedWarning = await this.buildLocalizedWarning(template, [
        spNMaxManure.ComputedNMaxRate,
      ]);

      warningMessages.push(
        await this.createWarningMessage(
          field.ID,
          crop.ID,
          field,
          buildLocalizedWarning,
          WarningCodesMapper.NMAXLIMIT,
          WarningLevelMapper.FIELD
        )
      );
    }

    // ======================================================================
    // 5️⃣ FIFTH WARNING — Closed Period Organic Manure
    // ======================================================================

    const spCheckClosedPeriod = await this.executeWarningSP(
      transactionalManager,
      "EXEC spWarning_CheckClosedPeriodOrganicManure @OrganicManureID = @0",
      [organicManure.ID]
    );

     const isClosedPeriodManureEngOrWales= await this.isClosedPeriodOrganicManureBreached(spCheckClosedPeriod);

    if (isClosedPeriodManureEngOrWales) {
      const template = await this.getWarningTemplate(
        transactionalManager,
        farm.CountryID,
        WarningKeyMapper.HIGHNORGANICMANURECLOSEDPERIOD
      );

      const buildLocalizedWarning = await this.buildLocalizedWarning(template);

      warningMessages.push(
        await this.createWarningMessage(
          field.ID,
          crop.ID,
          organicManure,
          buildLocalizedWarning,
          WarningCodesMapper.CLOSEDPERIODORGANICMANURE,
          WarningLevelMapper.MANURE
        )
      );
    }

    // ======================================================================
    // 6️⃣ SIXTH WARNING — Closed Period Organic Manure Exclusion
    // ======================================================================

    const spClosedPeriodManuresExculed =
      "EXEC spWarning_CheckClosedPeriodOrganicManureExclusion @OrganicManureID = @0";

    const spClosedPeriodExculedManures = await transactionalManager.query(
      spClosedPeriodManuresExculed,
      [organicManure.ID]
    );

    const spExculedManuresData = spClosedPeriodExculedManures[0];

    // -------------------------------
    // England Conditions
    // -------------------------------
    const isEnglandSixth =
      spExculedManuresData.IsFieldInEngland == 1 &&
      spExculedManuresData.IsWithinNVZ == 1 &&
      spExculedManuresData.IsFarmRegisteredOrganic == 1 &&
      spExculedManuresData.IsHighRanManures == 1 &&
      spExculedManuresData.InsideClosedPeriod == 1 &&
      spExculedManuresData.IsRestrictedCropTypeNotExist == 1;

    // -------------------------------
    // Wales Conditions
    // -------------------------------
    const isWalesSixth =
      spExculedManuresData.IsFieldInWelsh == 1 &&
      spExculedManuresData.IsFarmRegisteredOrganic == 0 &&
      spExculedManuresData.IsHighRanManures == 1 &&
      spExculedManuresData.InsideClosedPeriod == 1 &&
      spExculedManuresData.IsRestrictedCropTypeNotExist == 1;

    if (isEnglandSixth || isWalesSixth) {
      const template = await transactionalManager.findOne(WarningsEntity, {
        where: {
          CountryID: farm.CountryID,
          WarningKey:
            WarningKeyMapper.HIGHNORGANICMANURECLOSEDPERIODORGANICFARM,
        },
      });

      if (template) {
        const localized = {
          Header: template.Header,
          Para1: template.Para1,
          Para2: template.Para2,
          Para3: template.Para3,
        };

        warningMessages.push(
          await this.createWarningMessage(
            field.ID,
            crop.ID,
            organicManure,
            localized,
            WarningCodesMapper.CLOSEDPERIODORGANICMANURE,
            WarningLevelMapper.MANURE
          )
        );
      }
    }
    // ======================================================================
    // 7️⃣ SEVENTH WARNING — Closed Period to February N Limit
    // ======================================================================

    const spCheckClosedPeriodFebNLimit =
      "EXEC spWarning_CheckClosedPeriodFebNLimit @OrganicManureID = @0";

    const spCheckClosedPeriodFebResult = await transactionalManager.query(
      spCheckClosedPeriodFebNLimit,
      [organicManure.ID]
    );

    const spCheckClosedPeriodFebData = spCheckClosedPeriodFebResult[0];

    const isEnglandSeventh =
      spCheckClosedPeriodFebData.IsFieldInEngland == 1 &&
      spCheckClosedPeriodFebData.IsWithinNVZ == 1 &&
      spCheckClosedPeriodFebData.RegisteredOrganicProducer == 1 &&
      spCheckClosedPeriodFebData.IsHighRanManures == 1 &&
      spCheckClosedPeriodFebData.InsideClosedPeriodToFeb == 1 &&
      spCheckClosedPeriodFebData.IsAllowedCrop == 1 &&
      spCheckClosedPeriodFebData.IsTotalClosedPeriodNAboveLimit == 1;

    const isWalesSeventh =
      spCheckClosedPeriodFebData.IsFieldInWelsh == 1 &&
      spCheckClosedPeriodFebData.RegisteredOrganicProducer == 0 &&
      spCheckClosedPeriodFebData.IsHighRanManures == 1 &&
      spCheckClosedPeriodFebData.InsideClosedPeriodToFeb == 1 &&
      spCheckClosedPeriodFebData.IsAllowedCrop == 1 &&
      spCheckClosedPeriodFebData.IsTotalClosedPeriodNAboveLimit == 1;

    if (isEnglandSeventh || isWalesSeventh) {
      const template = await transactionalManager.findOne(WarningsEntity, {
        where: {
          CountryID: farm.CountryID,
          WarningKey: WarningKeyMapper.HIGHNORGANICMANUREMAXRATE,
        },
      });

      if (template) {
        const localized = {
          Header: template.Header,
          Para1: template.Para1,
          Para2: template.Para2,
          Para3: template.Para3,
        };

        warningMessages.push(
          await this.createWarningMessage(
            field.ID,
            crop.ID,
            organicManure,
            localized,
            WarningCodesMapper.MANUREAPPLICATIONLIMITCLOSEFEB201350,
            WarningLevelMapper.MANURE
          )
        );
      }
    }

    // ======================================================================
    // 8️⃣ EIGHTH WARNING — 28-day Closed Period Nitrogen Limit
    // ======================================================================

    const spEighth =
      "EXEC spWarning_CheckClosedPeriodTwentyEightDayLimit @OrganicManureId = @0";

    const eighthResult = await transactionalManager.query(spEighth, [
      organicManure.ID,
    ]);

    const eight = eighthResult[0];

    // ------------------------------------------------------
    // England Logic
    // ------------------------------------------------------
    const isEnglandEighth =
      eight.IsFieldInEngland == 1 &&
      eight.IsWithinNvz == 1 &&
      eight.IsRegisteredOrganicProducer == 1 &&
      eight.IsHighRanManures == 1 &&
      eight.IsInsideClosedPeriodToFebruary == 1 &&
      eight.IsCropTypeAllowed == 1 &&
      (eight.IsCurrentNitrogenAboveFifty == 1 ||
        eight.IsTotalClosedPeriodNitrogenAboveOneHundredFifty == 1 ||
        eight.IsPreviousApplicationWithinTwentyEightDays == 1);

    if (isEnglandEighth) {
      const template = await transactionalManager.findOne(WarningsEntity, {
        where: {
          CountryID: farm.CountryID,
          WarningKey: WarningKeyMapper.HIGHNORGANICMANUREMAXRATEWEEKS,
        },
      });

      if (template) {
        const localized = {
          Header: template.Header,
          Para1: template.Para1,
          Para2: template.Para2,
          Para3: template.Para3,
        };

        warningMessages.push(
          await this.createWarningMessage(
            field.ID,
            crop.ID,
            organicManure,
            localized,
            WarningCodesMapper.MANUREAPPLICATIONLIMITCLOSEFEB201350,
            WarningLevelMapper.MANURE
          )
        );
      }
    }

    // ======================================================================
    // 9️⃣ NINTH WARNING — Closed Period October Grass Limit (England only)
    // ======================================================================

    const spNinth =
      "EXEC spWarning_CheckClosedPeriodOctoberGrassLimit @OrganicManureID = @0";

    const ninthResult = await transactionalManager.query(spNinth, [
      organicManure.ID,
    ]);

    const ninth = ninthResult[0];

    const isEnglandNinth =
      ninth.IsFieldInEngland == 1 &&
      ninth.IsWithinNvz == 1 &&
      ninth.IsRegisteredOrganicProducer == 1 &&
      ninth.IsHighRanManures == 1 &&
      ninth.IsInsideClosedPeriodToOctober == 1 &&
      ninth.IsGrassCropType == 1 &&
      (ninth.IsTotalClosedPeriodNitrogenAboveOneHundredFifty == 1 ||
        ninth.IsAnyOrganicManureAboveForty == 1);

    if (isEnglandNinth) {
      const template = await transactionalManager.findOne(WarningsEntity, {
        where: {
          CountryID: farm.CountryID,
          WarningKey: WarningKeyMapper.HIGHNORGANICMANUREMAXRATEGRASS,
        },
      });

      if (template) {
        const localized = {
          Header: template.Header,
          Para1: template.Para1,
          Para2: template.Para2,
          Para3: template.Para3,
        };

        warningMessages.push(
          await this.createWarningMessage(
            field.ID,
            crop.ID,
            organicManure,
            localized,
            WarningCodesMapper.MANUREAPPLICATIONLIMITCLOSEFEB201350,
            WarningLevelMapper.MANURE
          )
        );
      }
    }
    // ======================================================================
    // 🔟 TENTH WARNING — Closed Period October Limit for Winter Oilseed Rape
    // ======================================================================

    const spTenth =
      "EXEC spWarning_CheckClosedPeriodOctoberWinterOilSeedRapeLimit @OrganicManureID = @0";

    const tenthResult = await transactionalManager.query(spTenth, [
      organicManure.ID,
    ]);

    const tenth = tenthResult[0];

    // -------------------------------
    // England ONLY logic
    // -------------------------------
    const isEnglandTenth =
      tenth.IsFieldInEngland == 1 &&
      tenth.IsWithinNvz == 1 &&
      tenth.IsRegisteredOrganicProducer == 1 &&
      tenth.IsHighRanManures == 1 &&
      tenth.IsInsideClosedPeriodToOctober == 1 &&
      tenth.IsWinterOilSeedRapeCropType == 1 &&
      tenth.IsTotalClosedPeriodNitrogenAboveOneHundredFifty == 1;

    if (isEnglandTenth) {
      const template = await transactionalManager.findOne(WarningsEntity, {
        where: {
          CountryID: farm.CountryID,
          WarningKey: WarningKeyMapper.HIGHNORGANICMANUREMAXRATEOSR,
        },
      });

      if (template) {
        const localized = {
          Header: template.Header,
          Para1: template.Para1,
          Para2: template.Para2,
          Para3: template.Para3,
        };

        warningMessages.push(
          await this.createWarningMessage(
            field.ID,
            crop.ID,
            organicManure,
            localized,
            WarningCodesMapper.MANUREAPPLICATIONLIMITCLOSEFEB201350,
            WarningLevelMapper.MANURE
          )
        );
      }
    }
    // ======================================================================
    // 1️⃣1️⃣ ELEVENTH WARNING — Closed Period October Rule (Grass + WOSR)
    // ======================================================================

    const spEleventh =
      "EXEC spWarning_CheckClosedPeriodOctoberGrassAndWinterOilSeedRape @OrganicManureID = @0";

    const eleventhResult = await transactionalManager.query(spEleventh, [
      organicManure.ID,
    ]);

    const eleventh = eleventhResult[0];

    // -------------------------------
    // England ONLY logic
    // -------------------------------
    const isEnglandEleventh =
      eleventh.IsFieldInEngland == 1 &&
      eleventh.IsWithinNvz == 1 &&
      eleventh.IsHighRanManures == 1 &&
      eleventh.IsInsideClosedPeriodToOctober == 1 &&
      (eleventh.IsWinterOilSeedRapeCropType == 1 ||
        eleventh.IsGrassCropType == 1);

    if (isEnglandEleventh) {
      const template = await transactionalManager.findOne(WarningsEntity, {
        where: {
          CountryID: farm.CountryID,
          WarningKey: WarningKeyMapper.HIGHNORGANICMANUREDATEONLY,
        },
      });

      if (template) {
        const localized = {
          Header: template.Header,
          Para1: template.Para1,
          Para2: template.Para2,
          Para3: template.Para3,
        };

        warningMessages.push(
          await this.createWarningMessage(
            field.ID,
            crop.ID,
            organicManure,
            localized,
            WarningCodesMapper.CLOSEDPERIODORGANICMANURE,
            WarningLevelMapper.MANURE
          )
        );
      }
    }

    // ======================================================================
    // 1️⃣2️⃣ TWELFTH WARNING — Closed Period End February Manure Rate
    // ======================================================================

    const spTwelfth =
      "EXEC spWarning_CheckClosedPeriodEndFebruaryManureRate @OrganicManureID = @0";

    const twelfthResult = await transactionalManager.query(spTwelfth, [
      organicManure.ID,
    ]);

    const twelfth = twelfthResult[0];

    // -------------------------------
    // England logic
    // -------------------------------
    const isEnglandTwelfth =
      twelfth.IsFieldInEngland == 1 &&
      twelfth.IsWithinNvz == 1 &&
      twelfth.IsInsideClosedPeriodToFebruary == 1 &&
      twelfth.IsAllowedManureType == 1 &&
      twelfth.IsApplicationRateAboveThirty == 1;

    // -------------------------------
    // Wales logic
    // -------------------------------
    const isWalesTwelfth =
      twelfth.IsFieldInWales == 1 &&
      twelfth.IsInsideClosedPeriodToFebruary == 1 &&
      twelfth.IsAllowedManureType == 1 &&
      twelfth.IsApplicationRateAboveThirty == 1;

    if (isEnglandTwelfth || isWalesTwelfth) {
      const template = await transactionalManager.findOne(WarningsEntity, {
        where: {
          CountryID: farm.CountryID,
          WarningKey: WarningKeyMapper.SLURRYMAXRATE,
        },
      });

      if (template) {
        const localized = {
          Header: template.Header,
          Para1: template.Para1,
          Para2: template.Para2,
          Para3: template.Para3,
        };

        warningMessages.push(
          await this.createWarningMessage(
            field.ID,
            crop.ID,
            organicManure,
            localized,
            WarningCodesMapper.MANUREAPPLICATIONLIMITCLOSEFEB201330,
            WarningLevelMapper.MANURE
          )
        );
      }
    }

    // ======================================================================
    // 1️⃣3️⃣ THIRTEENTH WARNING — Closed Period End February Poultry Manure
    // ======================================================================

    const spThirteenth =
      "EXEC spWarning_CheckClosedPeriodEndFebruaryPoultryManure @OrganicManureID = @0";

    const thirteenthResult = await transactionalManager.query(spThirteenth, [
      organicManure.ID,
    ]);

    const thirteenth = thirteenthResult[0];

    // -------------------------------
    // England Logic
    // -------------------------------
    const isEnglandThirteenth =
      thirteenth.IsFieldInEngland == 1 &&
      thirteenth.IsWithinNvz == 1 &&
      thirteenth.IsInsideClosedPeriodToFebruary == 1 &&
      thirteenth.IsAllowedPoultryManure == 1 &&
      thirteenth.IsApplicationRateAboveEight == 1;

    // -------------------------------
    // Wales Logic
    // -------------------------------
    const isWalesThirteenth =
      thirteenth.IsFieldInWales == 1 &&
      thirteenth.IsInsideClosedPeriodToFebruary == 1 &&
      thirteenth.IsAllowedPoultryManure == 1 &&
      thirteenth.IsApplicationRateAboveEight == 1;

    if (isEnglandThirteenth || isWalesThirteenth) {
      const template = await transactionalManager.findOne(WarningsEntity, {
        where: {
          CountryID: farm.CountryID,
          WarningKey: WarningKeyMapper.POULTRYMANUREMAXAPPLICATIONRATE,
        },
      });

      if (template) {
        const localized = {
          Header: template.Header,
          Para1: template.Para1,
          Para2: template.Para2,
          Para3: template.Para3,
        };

        warningMessages.push(
          await this.createWarningMessage(
            field.ID,
            crop.ID,
            organicManure,
            localized,
            WarningCodesMapper.MANUREAPPLICATIONLIMITCLOSEFEB201330,
            WarningLevelMapper.MANURE
          )
        );
      }
    }

    // ======================================================================
    // 1️⃣4️⃣ FOURTEENTH WARNING — Closed Period End February Poultry + Slurry 20-day rule
    // ======================================================================

    const spFourteenth =
      "EXEC spWarning_CheckClosedPeriodEndFebruaryPoultryAndSlurryTypesTwentyDays @OrganicManureID = @0";

    const fourteenthResult = await transactionalManager.query(spFourteenth, [
      organicManure.ID,
    ]);

    const fourteenth = fourteenthResult[0];

    // -------------------------------------------------------
    // England Logic
    // -------------------------------------------------------
    const isEnglandFourteenth =
      fourteenth.IsFieldInEngland == 1 &&
      fourteenth.IsWithinNvz == 1 &&
      fourteenth.IsInsideClosedPeriodToFebruary == 1 &&
      fourteenth.IsAllowedManureType == 1 &&
      fourteenth.IsPreviousApplicationWithinTwentyDays == 1;

    // -------------------------------------------------------
    // Wales Logic
    // -------------------------------------------------------
    const isWalesFourteenth =
      fourteenth.IsFieldInWales == 1 &&
      fourteenth.IsInsideClosedPeriodToFebruary == 1 &&
      fourteenth.IsAllowedManureType == 1 &&
      fourteenth.IsPreviousApplicationWithinTwentyDays == 1;

    if (isEnglandFourteenth || isWalesFourteenth) {
      const template = await transactionalManager.findOne(WarningsEntity, {
        where: {
          CountryID: farm.CountryID,
          WarningKey:
            WarningKeyMapper.ALLOWWEEKSBETWEENSLURRYPOULTRYAPPLICATIONS,
        },
      });

      if (template) {
        const localized = {
          Header: template.Header,
          Para1: template.Para1,
          Para2: template.Para2,
          Para3: template.Para3,
        };

        warningMessages.push(
          await this.createWarningMessage(
            field.ID,
            crop.ID,
            organicManure,
            localized,
            WarningCodesMapper.CLOSEDPERIODORGANICMANURE,
            WarningLevelMapper.MANURE
          )
        );
      }
    }

    // ======================================================================
    // RETURN ALL WARNINGS
    // ======================================================================

    return warningMessages;
  }

  async calculateFertiliserWarningMessage(transactionalManager, fertiliser) {
    const warningMessages = [];

    // ----------------------------------------------------------------------
    // LOAD MANAGEMENT PERIOD, CROP, FIELD, FARM  (same pattern as OM)
    // ----------------------------------------------------------------------
    const managementPeriod = await transactionalManager.findOne(
      ManagementPeriodEntity,
      { where: { ID: fertiliser.ManagementPeriodID } }
    );

    const crop = await transactionalManager.findOne(CropEntity, {
      where: { ID: managementPeriod.CropID },
    });

    const field = await transactionalManager.findOne(FieldEntity, {
      where: { ID: crop.FieldID },
    });

    const farm = await transactionalManager.findOne(FarmEntity, {
      where: { ID: field.FarmID },
    });

    // ======================================================================
    // 1️⃣ FERTILISER CLOSED-PERIOD CROP RESTRICTION WARNING
    // ======================================================================

    const spFert =
      "EXEC spWarning_CheckFertiliserClosedPeriodCropRestriction @FertiliserID = @0";

    const fertResult = await transactionalManager.query(spFert, [
      fertiliser.ID,
    ]);

    const fert = fertResult[0];

    /**
     * England Conditions
     */
    const isEngland = fert.IsFieldInEngland == 1 && fert.IsFieldWithinNVZ == 1;
    fert.IsApplicationInsideClosedPeriod == 1 && fert.IsCropTypeAllowed == 1;

    /**
     * Wales Conditions
     */
    const isWales =
      fert.IsFieldInWales == 1 &&
      fert.IsApplicationInsideClosedPeriod == 1 &&
      fert.IsCropTypeAllowed == 1;

    if (isEngland || isWales) {
      const template = await transactionalManager.findOne(WarningsEntity, {
        where: {
          CountryID: farm.CountryID,
          WarningKey: WarningKeyMapper.NITROFERTCLOSEDPERIOD,
        },
      });

      if (template) {
        const localized = {
          Header: template.Header,
          Para1: template.Para1,
          Para2: template.Para2,
          Para3: template.Para3,
        };

        warningMessages.push(
          await this.createWarningMessage(
            field.ID,
            crop.ID,
            fertiliser,
            localized,
            WarningCodesMapper.CLOSEDPERIODFERTILISER,
            WarningLevelMapper.FERTILISER
          )
        );
      }
    }

    // ======================================================================
    // 2️⃣ SECOND WARNING — Fertiliser Max N Limit for CropType
    // ======================================================================

    const spFertMaxN =
      "EXEC spWarning_CheckFertiliserClosedPeriodNitrogenLimit @FertiliserID = @0";

    const fertMaxNResult = await transactionalManager.query(spFertMaxN, [
      fertiliser.ID,
    ]);

    const maxN = fertMaxNResult[0];

    const isEnglandMaxN =
      maxN.IsFieldInEngland == 1 &&
      maxN.IsWithinNVZ == 1 &&
      maxN.IsApplicationInsideClosedPeriod == 1 &&
      maxN.IsAllowedCropType == 1 &&
      maxN.IsTotalNAboveLimit == 1;

    const isWalesMaxN =
      maxN.IsFieldInWales == 1 &&
      maxN.IsApplicationInsideClosedPeriod == 1 &&
      maxN.IsAllowedCropType == 1 &&
      maxN.IsTotalNAboveLimit == 1;

    if (isEnglandMaxN || isWalesMaxN) {
      const template = await transactionalManager.findOne(WarningsEntity, {
        where: {
          CountryID: farm.CountryID,
          WarningKey: WarningKeyMapper.INORGNMAXRATE,
        },
      });

      if (template) {
        const localized = {
          Header: template.Header,
          Para1: template.Para1,
          Para2: template.Para2,
          Para3: template.Para3,
        };

        const startDateFormatted = await this.formatToDayMonth(
          maxN.ClosedPeriodStartDate
        );
        const endDateFormatted = await this.formatToDayMonth(
          maxN.ClosedPeriodEndDate
        );

        const finalLocalized = await this.bindNumberedPlaceholders(localized, [
          startDateFormatted,
          endDateFormatted,
          maxN.MaxNitrogenRate,
        ]);

        warningMessages.push(
          await this.createWarningMessage(
            field.ID,
            crop.ID,
            fertiliser,
            finalLocalized,
            WarningCodesMapper.MAXAPPLICATIONRATEINORGFERTCROPCLOSEDSPREADINGPERIOD,
            WarningLevelMapper.FERTILISER
          )
        );
      }
    }

    // ======================================================================
    // 3 FERTILISER WARNING — Closed Period 28-Day & N Limit Check
    // ======================================================================

    const spFertSecond =
      "EXEC spWarning_CheckFertiliserClosedPeriodTwentyEightDayLimit @FertiliserID = @0";

    const fertSecondResult = await transactionalManager.query(spFertSecond, [
      fertiliser.ID,
    ]);

    const fert2 = fertSecondResult[0];

    // ------------------------------------------------------
    // ENGLAND CONDITIONS
    // ------------------------------------------------------
    const isEnglandSecondFert =
      fert2.IsFieldInEngland == 1 &&
      fert2.IsWithinNVZ == 1 &&
      fert2.IsInsideClosedPeriod == 1 &&
      fert2.IsCropTypeAllowed == 1 &&
      (fert2.IsCurrentNAbove50 == 1 ||
        fert2.IsTotalNAbove100 == 1 ||
        fert2.IsPreviousApplicationWithin28Days == 1);

    // ------------------------------------------------------
    // WALES CONDITIONS
    // ------------------------------------------------------
    const isWalesSecondFert =
      fert2.IsFieldInWales == 1 &&
      fert2.IsInsideClosedPeriod == 1 &&
      fert2.IsCropTypeAllowed == 1 &&
      (fert2.IsCurrentNAbove50 == 1 ||
        fert2.IsTotalNAbove100 == 1 ||
        fert2.IsPreviousApplicationWithin28Days == 1);

    if (isEnglandSecondFert || isWalesSecondFert) {
      const template = await transactionalManager.findOne(WarningsEntity, {
        where: {
          CountryID: farm.CountryID,
          WarningKey: WarningKeyMapper.INORGNMAXRATEBRASSICA,
        },
      });

      if (template) {
        const localized = {
          Header: template.Header,
          Para1: template.Para1,
          Para2: template.Para2,
          Para3: template.Para3,
        };
        const startDateFormatted = await this.formatToDayMonth(
          fert2.ClosedPeriodStart
        );
        const endDateFormatted = await this.formatToDayMonth(
          fert2.ClosedPeriodEnd
        );
        const finalLocalized = await this.bindNumberedPlaceholders(localized, [
          startDateFormatted,
          endDateFormatted,
        ]);

        warningMessages.push(
          await this.createWarningMessage(
            field.ID,
            crop.ID,
            fertiliser,
            finalLocalized,
            WarningCodesMapper.MAXAPPLICATIONRATEINORGFERTCROPCLOSEDSPREADINGPERIOD,
            WarningLevelMapper.FERTILISER
          )
        );
      }
    }
    // ======================================================================
    // 4 Fourth WARNING — Closed Period to 31 October (NEW SP)
    // ======================================================================

    const spFertOct =
      "EXEC spWarning_CheckFertiliserClosedPeriodToOctoberLimit @FertiliserID = @0";

    const octResult = await transactionalManager.query(spFertOct, [
      fertiliser.ID,
    ]);

    const oct = octResult[0];

    // ------------------------
    // England Logic
    // ------------------------
    const isEnglandOct =
      oct.IsFieldInEngland == 1 &&
      oct.IsWithinNVZ == 1 &&
      oct.IsInsideClosedPeriodToOctober == 1 &&
      oct.IsCropTypeAllowed == 1 &&
      oct.IsTotalNAbove30 == 1;

    // ------------------------
    // Wales Logic
    // ------------------------
    const isWalesOct =
      oct.IsFieldInWales == 1 &&
      oct.IsInsideClosedPeriodToOctober == 1 &&
      oct.IsCropTypeAllowed == 1 &&
      oct.IsTotalNAbove30 == 1;

    if (isEnglandOct || isWalesOct) {
      const template = await transactionalManager.findOne(WarningsEntity, {
        where: {
          CountryID: farm.CountryID,
          WarningKey: WarningKeyMapper.INORGNMAXRATEOSR,
        },
      });

      if (template) {
        const localized = {
          Header: template.Header,
          Para1: template.Para1,
          Para2: template.Para2,
          Para3: template.Para3,
        };

        const startDateFormatted = await this.formatToDayMonth(
          oct.ClosedPeriodStart
        );

        const finalLocalized = await this.bindNumberedPlaceholders(localized, [
          startDateFormatted,
        ]);

        warningMessages.push(
          await this.createWarningMessage(
            field.ID,
            crop.ID,
            fertiliser,
            finalLocalized,
            WarningCodesMapper.MAXAPPLICATIONRATEINORGFERTCROPCLOSEDSPREADINGPERIOD,
            WarningLevelMapper.FERTILISER
          )
        );
      }
    }

    // ======================================================================
    // 5 Fifth FERTILISER WARNING — OCTOBER GRASS HIGH N > 40 AND SUM N > 80
    // ======================================================================

    const spFert3 =
      "EXEC spWarning_CheckFertiliserClosedPeriodOctoberGrassHighN @FertiliserID = @0";

    const fertRes3 = await transactionalManager.query(spFert3, [fertiliser.ID]);

    const fert3 = fertRes3[0];

    const isEngland3 =
      fert3.IsFieldInEngland == 1 &&
      fert3.IsWithinNVZ == 1 &&
      fert3.IsGrassCropType == 1 &&
      fert3.IsInsideClosedPeriodToOctober == 1 &&
      fert3.IsCurrentNAbove40 == 1 &&
      fert3.IsTotalClosedPeriodNAbove80 == 1;

    const isWales3 =
      fert3.IsFieldInWales == 1 &&
      fert3.IsGrassCropType == 1 &&
      fert3.IsInsideClosedPeriodToOctober == 1 &&
      fert3.IsCurrentNAbove40 == 1 &&
      fert3.IsTotalClosedPeriodNAbove80 == 1;

    if (isEngland3 || isWales3) {
      const template = await transactionalManager.findOne(WarningsEntity, {
        where: {
          CountryID: farm.CountryID,
          WarningKey: WarningKeyMapper.INORGNMAXRATEGRASS,
        },
      });

      if (template) {
        const localized = {
          Header: template.Header,
          Para1: template.Para1,
          Para2: template.Para2,
          Para3: template.Para3,
        };

        const startDateFormatted = await this.formatToDayMonth(
          fert3.ClosedPeriodStart
        );

        const finalLocalized = await this.bindNumberedPlaceholders(localized, [
          startDateFormatted,
        ]);

        warningMessages.push(
          await this.createWarningMessage(
            field.ID,
            crop.ID,
            fertiliser,
            finalLocalized,
            WarningCodesMapper.MAXAPPLICATIONRATEINORGFERTCROPCLOSEDSPREADINGPERIOD,
            WarningLevelMapper.FERTILISER
          )
        );
      }
    }

    // ======================================================================
    // 6 FERTILISER WARNING — Closed Period Oct 31 → Closed Period End
    // Grass (140) or Winter Oilseed Rape (20)
    // ======================================================================

    const spFertOct31 =
      "EXEC spWarning_CheckFertiliserClosedPeriodOct31ToClosedPeriod @FertiliserID = @0";

    const fertOct31Result = await transactionalManager.query(spFertOct31, [
      fertiliser.ID,
    ]);

    const fertOct31 = fertOct31Result[0];

    // -------------------------------------------------------
    // ENGLAND conditions
    // -------------------------------------------------------
    const isEnglandOct31 =
      fertOct31.IsFieldInEngland == 1 &&
      fertOct31.IsWithinNVZ == 1 &&
      fertOct31.IsApplicationInsideOct31ToClosedPeriod == 1 &&
      (fertOct31.IsGrassCropType == 1 ||
        fertOct31.IsWinterOilSeedRapeCropType == 1);

    // -------------------------------------------------------
    // WALES conditions
    // -------------------------------------------------------
    const isWalesOct31 =
      fertOct31.IsFieldInWales == 1 &&
      fertOct31.IsApplicationInsideOct31ToClosedPeriod == 1 &&
      (fertOct31.IsGrassCropType == 1 ||
        fertOct31.IsWinterOilSeedRapeCropType == 1);

    // -------------------------------------------------------
    // If triggered, push warning
    // -------------------------------------------------------
    if (isEnglandOct31 || isWalesOct31) {
      const template = await transactionalManager.findOne(WarningsEntity, {
        where: {
          CountryID: farm.CountryID,
          WarningKey: WarningKeyMapper.INORGFERTDATEONLY,
        },
      });

      if (template) {
        const localized = {
          Header: template.Header,
          Para1: template.Para1,
          Para2: template.Para2,
          Para3: template.Para3,
        };

        warningMessages.push(
          await this.createWarningMessage(
            field.ID,
            crop.ID,
            fertiliser,
            localized,
            WarningCodesMapper.CLOSEDPERIODFERTILISER,
            WarningLevelMapper.FERTILISER
          )
        );
      }
    }

    const spNMaxFertiliser =
      "EXEC spWarning_ComputeNMaxRateCombined @ManureID = @0";

    const nMaxFertiliserResult = await transactionalManager.query(
      spNMaxFertiliser,
      [fertiliser.ID]
    );

    const nMaxFertiliserData = nMaxFertiliserResult[0];

    // -------------------------------
    // England logic
    // -------------------------------
    const isEnglandFourth =
      nMaxFertiliserData.IsFieldEngland == 1 &&
      nMaxFertiliserData.IsFieldWithinNVZ == 1 &&
      nMaxFertiliserData.IsCropTypeHasNMax == 1 &&
      nMaxFertiliserData.IsNExceeding == 1;

    // -------------------------------
    // Wales logic
    // -------------------------------
    const isWalesFourth =
      nMaxFertiliserData.IsFieldWales == 1 &&
      nMaxFertiliserData.IsCropTypeHasNMax == 1 &&
      nMaxFertiliserData.IsNExceeding == 1;

    if (isEnglandFourth || isWalesFourth) {
      const template = await transactionalManager.findOne(WarningsEntity, {
        where: {
          CountryID: farm.CountryID,
          WarningKey: WarningKeyMapper.NMAXLIMIT,
        },
      });

      if (template) {
        const baseLocalized = {
          Header: template.Header,
          Para1: template.Para1,
          Para2: template.Para2,
          Para3: template.Para3,
        };

        // -------------------------------
        // BIND ComputedNMaxRate as dynamic value
        // -------------------------------
        const finalLocalized = await this.bindNumberedPlaceholders(
          baseLocalized,
          [nMaxFertiliserData.ComputedNMaxRate]
        );

        warningMessages.push(
          await this.createWarningMessage(
            field.ID,
            crop.ID,
            field,
            finalLocalized,
            WarningCodesMapper.NMAXLIMIT,
            WarningLevelMapper.FIELD
          )
        );
      }
    }

    // ======================================================================
    // Return warnings for fertiliser only
    // ======================================================================
    return warningMessages;
  }

  async formatToDayMonth(date) {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
    });
  }
}

module.exports = { CalculateWarningMessageService };
