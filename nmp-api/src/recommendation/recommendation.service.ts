import { EntityManager, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { RecommendationEntity } from '@db/entity/recommendation.entity';
import { ApiDataResponseType } from '@shared/base.response';
import { BaseService } from '@src/base/base.service';
import { RecommendationCommentEntity } from '@db/entity/recommendation-comment.entity';

@Injectable()
export class RecommendationService extends BaseService<
  RecommendationEntity,
  ApiDataResponseType<RecommendationEntity>
> {
  constructor(
    @InjectRepository(RecommendationEntity)
    protected readonly repository: Repository<RecommendationEntity>,
    @InjectRepository(RecommendationCommentEntity)
    protected readonly recommendationCommentRepository: Repository<RecommendationCommentEntity>,
    protected readonly entityManager: EntityManager,
  ) {
    super(repository, entityManager);
  }

  async getNutrientsRecommendationsForField(
    fieldId: number,
    harvestYear: number,
  ): Promise<RecommendationEntity[]> {
    try {
      const storedProcedure =
        'EXEC dbo.spRecommendations_GetRecommendations @fieldId = @0, @harvestYear = @1';
      const recommendations = await this.executeQuery(storedProcedure, [
        fieldId,
        harvestYear,
      ]);
      const mappedRecommendations = recommendations.map((r) => {
        const data = { Crop: {}, Recommendation: {} };
        Object.keys(r).forEach((recDataKey) => {
          if (recDataKey.startsWith('Crop_'))
            data.Crop[recDataKey.slice(5)] = r[recDataKey];
          else if (recDataKey.startsWith('Recommendation_'))
            data.Recommendation[recDataKey.slice(15)] = r[recDataKey];
        });
        return data;
      });

      const groupedObj: Record<string, Record<string, any>> = {};

      mappedRecommendations.forEach((r) => {
        groupedObj[r.Crop.ID] = {
          Crop: r.Crop,
          Recommendations: (
            groupedObj[r.Crop.ID]?.Recommendations || []
          ).concat(r.Recommendation),
        };
      });

      const dataWithComments: any = await Promise.all(
        Object.values(groupedObj).map(async (r) => ({
          ...r,
          Recommendations: await Promise.all(
            r.Recommendations.map(async (recData) => {
              const comments = await this.recommendationCommentRepository.find({
                where: {
                  RecommendationID: recData.ID,
                },
              });
              return {
                Recommendation: recData,
                RecommendationComments: comments,
              };
            }),
          ),
        })),
      );
      return dataWithComments;
    } catch (error) {
      console.error('Error while fetching join data:', error);
      throw error;
    }
  }
}
