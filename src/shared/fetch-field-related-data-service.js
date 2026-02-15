const { CountryEntity } = require("../db/entity/country.entity");
const { FarmEntity } = require("../db/entity/farm.entity");
const { FieldEntity } = require("../db/entity/field.entity");

class FieldRelated {
    
  async getFieldAndCountryData(fieldId, transactionalManager) {
    return (
      transactionalManager
        .createQueryBuilder(FieldEntity, "f")
        /* ---------- Farm ---------- */
        .leftJoin(FarmEntity, "farm", "farm.ID = f.FarmID")
        /* ---------- Country ---------- */
        .leftJoin(CountryEntity, "country", "country.ID = farm.CountryID")
        /* ---------- Select minimal required fields ---------- */
        .select([
          "f.ID AS ID",
          "f.Name AS FieldName",
          "f.SoilTypeID AS SoilTypeID",
          "f.IsWithinNVZ AS IsWithinNVZ",
          "f.SoilReleasingClay AS SoilReleasingClay",
          "f.NVZProgrammeID AS NVZProgrammeID",
          "farm.ID AS FarmID",
          "farm.ClimateDataPostCode AS ClimateDataPostCode",
          "farm.Rainfall AS Rainfall",
          "country.ID AS CountryID",
          "country.RB209CountryID AS RB209CountryID",
        ])
        .where("f.ID = :fieldId", { fieldId })
        .getRawOne()
    );
  }
}
module.exports = { FieldRelated };