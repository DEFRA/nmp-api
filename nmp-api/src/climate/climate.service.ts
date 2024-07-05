import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import ClimateDatabaseEntity from '@db/entity/climate-data.entity';
import { BaseService } from '@src/base/base.service';
import { ApiDataResponseType } from '@shared/base.response';
import { validateISODateFormat } from '@shared/dateValidate';

@Injectable()
export class ClimateService extends BaseService<
  ClimateDatabaseEntity,
  ApiDataResponseType<ClimateDatabaseEntity>
> {
  constructor(
    @InjectRepository(ClimateDatabaseEntity)
    protected readonly repository: Repository<ClimateDatabaseEntity>,
    protected readonly entityManager: EntityManager,
  ) {
    super(repository, entityManager);
  }

  private calculateTotalRainfall(
    climateData: ClimateDatabaseEntity,
    startMonth: number,
    endMonth: number,
    startYear: number,
    endYear: number,
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
      throw new BadRequestException(
        'Start year should not be greater than end year',
      );
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

  private calculateRainfallAverage(climateData: ClimateDatabaseEntity) {
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
      ).toFixed(5),
    );
    const rainfallAverage = Math.round(rainfallMeanSum);

    return {
      rainfallAverage,
    };
  }

  async getRainfallAverageByPostcode(postCode: string) {
    const climateData = await this.repository.findOne({
      where: { PostCode: postCode },
    });

    if (!climateData) {
      throw new NotFoundException('Postcode not found');
    }

    return this.calculateRainfallAverage(climateData);
  }

  async getTotalRainfallByPostcodeAndDate(
    postCode: string,
    startDate: string,
    endDate: string,
  ) {
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
      throw new NotFoundException('Postcode not found');
    }

    return this.calculateTotalRainfall(
      climateData,
      startMonth,
      endMonth,
      startYear,
      endYear,
    );
  }
}
