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
    const rainfallAverage =
      climateData?.RainFallMeanJan +
      climateData?.RainFallMeanFeb +
      climateData?.RainFallMeanMar +
      climateData?.RainFallMeanApr +
      climateData?.RainFallMeanMay +
      climateData?.RainFallMeanJun +
      climateData?.RainFallMeanJul +
      climateData?.RainFallMeanAug +
      climateData?.RainFallMeanSep +
      climateData?.RainFallMeanOct +
      climateData?.RainFallMeanNov +
      climateData?.RainFallMeanDec;

    return {
      rainfallAverage,
    };
  }

  async getRainfallAverageByPostcode(postCode: string) {
    const climateData = await this.repository.findOneBy({
      PostCode: postCode,
    });
    return this.calculateRainfallAverage(climateData);
  }
}
