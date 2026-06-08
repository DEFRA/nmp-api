const { calculatePreviousGrassHistoryMethods } = require("./calculate-previous-grass-history.service");
const { calculatePreviousGrassLeyMethods } = require("./calculate-previous-grass-ley.service");
const { calculatePreviousGrassLookupMethods } = require("./calculate-previous-grass-lookup.service");

class CalculateGrassHistoryAndPreviousGrass {
  async calculateIsReseeded(...args) {
    return calculatePreviousGrassHistoryMethods.calculateIsReseeded.call(this, ...args);
  }

  async getGrassHistoryID(...args) {
    return calculatePreviousGrassHistoryMethods.getGrassHistoryID.call(this, ...args);
  }

  async getCropForYear(...args) {
    return calculatePreviousGrassHistoryMethods.getCropForYear.call(this, ...args);
  }

  async calculateLeyFromHistory(...args) {
    return calculatePreviousGrassLeyMethods.calculateLeyFromHistory.call(this, ...args);
  }

  async calculateLeyFromCropData(...args) {
    return calculatePreviousGrassLeyMethods.calculateLeyFromCropData.call(this, ...args);
  }

  async calculateLeyDuration(...args) {
    return calculatePreviousGrassLeyMethods.calculateLeyDuration.call(this, ...args);
  }

  async getExtendedFieldTypesForLeyCheck(...args) {
    return calculatePreviousGrassLeyMethods.getExtendedFieldTypesForLeyCheck.call(this, ...args);
  }

  async isArableGrassGrass(...args) {
    return calculatePreviousGrassLeyMethods.isArableGrassGrass.call(this, ...args);
  }

  async isArableArableGrass(...args) {
    return calculatePreviousGrassLeyMethods.isArableArableGrass.call(this, ...args);
  }

  async getGrassCropFromCropEntity(...args) {
    return calculatePreviousGrassLookupMethods.getGrassCropFromCropEntity.call(this, ...args);
  }

  async getGrassCropFromPreviousCropping(...args) {
    return calculatePreviousGrassLookupMethods.getGrassCropFromPreviousCropping.call(this, ...args);
  }

  async getPreviousGrass(...args) {
    return calculatePreviousGrassLookupMethods.getPreviousGrass.call(this, ...args);
  }

  async isValidGrassCrop(...args) {
    return calculatePreviousGrassLookupMethods.isValidGrassCrop.call(this, ...args);
  }

  async getSwardManagementFlags(...args) {
    return calculatePreviousGrassLookupMethods.getSwardManagementFlags.call(this, ...args);
  }

  async getPreviousGrassManagementFlags(...args) {
    return calculatePreviousGrassLookupMethods.getPreviousGrassManagementFlags.call(this, ...args);
  }

  async isHighCloverCrop(...args) {
    return calculatePreviousGrassLookupMethods.isHighCloverCrop.call(this, ...args);
  }

  async calculateNitrogenUseFromPreviousGrass(...args) {
    return calculatePreviousGrassLookupMethods.calculateNitrogenUseFromPreviousGrass.call(this, ...args);
  }

  async calculateTotalNitrogenUseForCrop(...args) {
    return calculatePreviousGrassLookupMethods.calculateTotalNitrogenUseForCrop.call(this, ...args);
  }

  async findLastGrassCropDetails(...args) {
    return calculatePreviousGrassLookupMethods.findLastGrassCropDetails.call(this, ...args);
  }

  async getPreviousGrassID(...args) {
    return calculatePreviousGrassLookupMethods.getPreviousGrassID.call(this, ...args);
  }
}
module.exports = { CalculateGrassHistoryAndPreviousGrass };
