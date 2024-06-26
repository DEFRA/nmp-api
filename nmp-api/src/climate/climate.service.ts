// src/climate/climate.service.ts

import ClimateDataEntity from '@db/entity/climate-date.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiDataResponseType } from '@shared/base.response';
import { BaseService } from '@src/base/base.service';
import { EntityManager, Repository } from 'typeorm';


@Injectable()
export class ClimateService extends BaseService<
  ClimateDataEntity,
  ApiDataResponseType<ClimateDataEntity>
> {
  constructor(
    @InjectRepository(ClimateDataEntity)
    protected readonly repository: Repository<ClimateDataEntity>,
    protected readonly entityManager: EntityManager,
  ) {
    super(repository, entityManager);
  }
  private calculateRainfallAverage(climateData: ClimateDataEntity) {
    const rainfallAverage = Number(
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
