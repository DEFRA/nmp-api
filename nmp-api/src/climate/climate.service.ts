import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import ClimateDatabaseEntity from '@db/entity/climate-data.entity';

@Injectable()
export class ClimateService {
  constructor(
    @InjectRepository(ClimateDatabaseEntity)
    private readonly repository: Repository<ClimateDatabaseEntity>,
    private readonly entityManager: EntityManager,
  ) {}

  private validateDateFormat(dateString: string): Date {
    const parts = dateString.split(/[\s-]/);
    if (parts.length !== 3) {
      throw new BadRequestException('Invalid date format. Use "dd-mm-yyyy".');
    }
    const [day, month, year] = parts.map(Number);
    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() + 1 !== month ||
      date.getDate() !== day
    ) {
      throw new BadRequestException('Invalid date.');
    }
    return date;
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
    const startDateObj = this.validateDateFormat(startDate);
    const endDateObj = this.validateDateFormat(endDate);

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
