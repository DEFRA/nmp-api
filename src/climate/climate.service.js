const { AppDataSource } = require("../db/data-source");
const { ClimateDatabaseEntity } = require("../db/entity/climate.entity");
const { validateISODateFormat } = require(".././shared/dataValidate");
const { BaseService } = require("../base/base.service");
const boom = require("@hapi/boom");

class ClimateService extends BaseService {
  constructor() {
    super(ClimateDatabaseEntity);
    this.repository = AppDataSource.getRepository(ClimateDatabaseEntity);
  }

  calculateRainfallAverage(climateData) {
    const rainfallMeanSum = Number(
      (
        climateData?.MeanTotalRainFallJan +
        climateData?.MeanTotalRainFallFeb +
        climateData?.MeanTotalRainFallMar +
        climateData?.MeanTotalRainFallApr +
        climateData?.MeanTotalRainFallMay +
        climateData?.MeanTotalRainFallJun +
        climateData?.MeanTotalRainFallJul +
        climateData?.MeanTotalRainFallAug +
        climateData?.MeanTotalRainFallSep +
        climateData?.MeanTotalRainFallOct +
        climateData?.MeanTotalRainFallNov +
        climateData?.MeanTotalRainFallDec
      ).toFixed(5)
    );
    const rainfallAverage = Math.round(rainfallMeanSum);

    return {
      rainfallAverage,
    };
  }

  calculateTotalRainfall(
    climateData,
    startMonth,
    endMonth,
    startYear,
    endYear
  ) {
    if (!climateData) {
      return { totalRainfall: 0 };
    }

    const months = [
      climateData.MeanTotalRainFallJan,
      climateData.MeanTotalRainFallFeb,
      climateData.MeanTotalRainFallMar,
      climateData.MeanTotalRainFallApr,
      climateData.MeanTotalRainFallMay,
      climateData.MeanTotalRainFallJun,
      climateData.MeanTotalRainFallJul,
      climateData.MeanTotalRainFallAug,
      climateData.MeanTotalRainFallSep,
      climateData.MeanTotalRainFallOct,
      climateData.MeanTotalRainFallNov,
      climateData.MeanTotalRainFallDec,
    ];

    let totalRainfall = 0;
    if (startYear > endYear) {
      throw new Error("Start year should not be greater than end year");
    }

    if (startMonth > endMonth) {
      const firstPart = months
        .slice(startMonth - 1, 12)
        .reduce((acc, month) => acc + month, 0);
      const secondPart = months
        .slice(0, endMonth)
        .reduce((acc, month) => acc + month, 0);
      totalRainfall = firstPart + secondPart;
    } else {
      totalRainfall = months
        .slice(startMonth - 1, endMonth)
        .reduce((acc, month) => acc + month, 0);
    }

    return {
      totalRainfall: Math.round(Number(totalRainfall.toFixed(2))),
    };
  }

  async getRainfallAverageByPostcode(postCode) {
    const climateData = await this.repository.findOne({
      where: { PostCode: postCode },
    });

    if (!climateData) {
      throw boom.notFound("Postcode not found");
    }

    return this.calculateRainfallAverage(climateData);
  }

  async getTotalRainfallByPostcodeAndDate(postCode, startDate, endDate) {
    const startDateObj = validateISODateFormat(startDate);
    const endDateObj = validateISODateFormat(endDate);

    const startMonth = startDateObj.getMonth() + 1;
    const endMonth = endDateObj.getMonth() + 1;
    const startYear = startDateObj.getFullYear();
    const endYear = endDateObj.getFullYear();

    const climateData = await this.repository.findOne({
      where: { PostCode: postCode },
    });

    if (!climateData) {
      throw boom.notFound(`Postcode not found`);
    }

    return this.calculateTotalRainfall(
      climateData,
      startMonth,
      endMonth,
      startYear,
      endYear
    );
  }
}

module.exports = { ClimateService };
