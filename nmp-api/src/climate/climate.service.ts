// src/climate/climate.service.ts

import ClimateDatabaseEntity from '@db/entity/climate-data.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiDataResponseType } from '@shared/base.response';
import { BaseService } from '@src/base/base.service';
import { EntityManager, Repository } from 'typeorm';

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
      throw new Error('Climate data not found');
    }

    return this.calculateRainfallAverage(climateData);
  }
}
