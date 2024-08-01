import SoilAnalysisEntity from '@db/entity/soil-analysis.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiDataResponseType } from '@shared/base.response';
import { BaseService } from '@src/base/base.service';
import { DeepPartial, EntityManager, Repository } from 'typeorm';

@Injectable()
export class SoilAnalysisService extends BaseService<
  SoilAnalysisEntity,
  ApiDataResponseType<SoilAnalysisEntity>
> {
  constructor(
    @InjectRepository(SoilAnalysisEntity)
    protected readonly repository: Repository<SoilAnalysisEntity>,
    protected readonly entityManager: EntityManager,
  ) {
    super(repository, entityManager);
  }
  async createSoilAnalysis(
    soilAnalysisBody: DeepPartial<SoilAnalysisEntity>,
    userId: number,
  ) {
    const SoilAnalysis = await this.repository.save({
      ...soilAnalysisBody,
      CreatedByID: userId,
    });

    return SoilAnalysis;
  }

  async updateSoilAnalysis(
    updatedSoilAnalysisData: DeepPartial<SoilAnalysisEntity>,
    userId: number,
    soilAnalysisId: number,
  ) {
    const result = await this.repository.update(soilAnalysisId, {
      ...updatedSoilAnalysisData,
      ModifiedByID: userId,
      ModifiedOn: new Date(),
    });

    if (result.affected === 0) {
      throw new NotFoundException(
        `SoilAnalysis with ID ${soilAnalysisId} not found`,
      );
    }

    const updatedSoilAnalysis = await this.repository.findOne({
      where: { ID: soilAnalysisId },
    });
    return updatedSoilAnalysis;
  }
}
