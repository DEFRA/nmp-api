const {
  CalculateNextDefoliationService,
} = require("./calculate-next-defoliation-totalN");
const {
  CalculateTotalAvailableNForNextYear,
} = require("./calculate-next-year-available-n");
const {
  cropRecommendationMethods,
} = require("./saving-recommendation-crop.service");
const {
  recommendationCommentMethods,
} = require("./saving-recommendation-comments.service");

class SavingRecommendationService {
  constructor() {
    this.CalculateNextDefoliationService =
      new CalculateNextDefoliationService();
    this.CalculateTotalAvailableNForPreviousYear =
      new CalculateTotalAvailableNForNextYear();
  }
}

Object.assign(
  SavingRecommendationService.prototype,
  cropRecommendationMethods,
  recommendationCommentMethods,
);

module.exports = { SavingRecommendationService };
