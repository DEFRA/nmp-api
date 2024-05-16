import { EntityManager, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { RecommendationEntity } from '@db/entity/recommendation.entity';
import { ApiDataResponseType } from '@shared/base.response';
import { BaseService } from '@src/base/base.service';

@Injectable()
export class RecommendationService extends BaseService<
  RecommendationEntity,
  ApiDataResponseType<RecommendationEntity>
> {
  constructor(
    @InjectRepository(RecommendationEntity)
    protected readonly repository: Repository<RecommendationEntity>,
    protected readonly entityManager: EntityManager,
  ) {
    super(repository, entityManager);
  }

  async getNutrientsRecommendationsForField(
    fieldId,
    harvestYear,
  ): Promise<RecommendationEntity[]> {
    try {
      const storedProcedure =
        'EXEC dbo.spRecommendations_GetRecommendations @fieldId = @0, @harvestYear = @1';
      const recommendations = await this.executeQuery(storedProcedure, [
        fieldId,
        harvestYear,
      ]);
      return recommendations;
    } catch (error) {
      console.error('Error while fetching join data:', error);
      throw error;
    }
  }
}
