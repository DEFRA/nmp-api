import { EntityManager, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { RecommendationEntity } from '@db/entity/recommendation.entity';
import { ApiDataResponseType } from '@shared/base.response';
import { BaseService } from '@src/base/base.service';
import { RecommendationCommentEntity } from '@db/entity/recommendation-comment.entity';
import { OrganicManureEntity } from '@db/entity/organic-manure.entity';

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
    @InjectRepository(OrganicManureEntity)
    protected readonly organicManureRepository: Repository<OrganicManureEntity>,
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
        const data = { Crop: {}, Recommendation: {}, ManagementPeriod: {} };
        Object.keys(r).forEach((recDataKey) => {
          if (recDataKey.startsWith('Crop_'))
            data.Crop[recDataKey.slice(5)] = r[recDataKey];
          else if (recDataKey.startsWith('Recommendation_'))
            data.Recommendation[recDataKey.slice(15)] = r[recDataKey];
          else if (recDataKey.startsWith('ManagementPeriod_'))
            data.ManagementPeriod[recDataKey.slice(17)] = r[recDataKey];
        });
        return data;
      });

      const groupedObj: Record<string, Record<string, any>> = {};

      mappedRecommendations.forEach((r) => {
        groupedObj[r.Crop.ID] = {
          Crop: r.Crop,
          Recommendations: (
            groupedObj[r.Crop.ID]?.Recommendations || []
          ).concat({
            Recommendation: r.Recommendation,
            ManagementPeriod: r.ManagementPeriod,
          }),
        };
      });

      const dataWithComments: any = await Promise.all(
        Object.values(groupedObj).map(async (r) => ({
          ...r,
          Recommendations: await Promise.all(
            r.Recommendations.map(async (recData) => {
              const comments = await this.recommendationCommentRepository.find({
                where: {
                  RecommendationID: recData.Recommendation.ID,
                },
              });
              const organicManures = await this.organicManureRepository.find({
                where: {
                  ManagementPeriodID: recData.ManagementPeriod.ID,
                },
                select: {
                  ID: true,
                  ManureTypeID: true,
                  ApplicationDate: true,
                  ApplicationRate: true,
                  ApplicationMethodID: true,
                  ManureType: {
                    ID: true,
                    Name: true,
                  },
                  ApplicationMethod: {
                    ID: true,
                    Name: true,
                  },
                },
                relations: ['ManureType', 'ApplicationMethod'],
              });
              return {
                Recommendation: recData.Recommendation,
                RecommendationComments: comments,
                ManagementPeriod: recData.ManagementPeriod,
                OrganicManures: organicManures.map((o) => {
                  const organicManureData = {
                    ...o,
                    ManureTypeName: o.ManureType.Name,
                    ApplicationMethodName: o.ApplicationMethod.Name,
                  };
                  delete organicManureData.ManureType;
                  delete organicManureData.ApplicationMethod;
                  return organicManureData;
                }),
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
