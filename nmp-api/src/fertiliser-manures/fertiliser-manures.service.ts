import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, DeepPartial } from 'typeorm';
import { BaseService } from '../base/base.service';
import { FertiliserManuresEntity } from '@db/entity/fertiliser-manures.entity';
import { ApiDataResponseType } from '@shared/base.response';
import { RecommendationEntity } from '@db/entity/recommendation.entity';

@Injectable()
export class FertiliserManuresService extends BaseService<
  FertiliserManuresEntity,
  ApiDataResponseType<FertiliserManuresEntity>
> {
  constructor(
    @InjectRepository(FertiliserManuresEntity)
    protected readonly repository: Repository<FertiliserManuresEntity>,
    @InjectRepository(RecommendationEntity)
    protected readonly recommendationRepository: Repository<RecommendationEntity>,
    protected readonly entityManager: EntityManager,
  ) {
    super(repository, entityManager);
  }

  async createFertiliserManures(
    data: DeepPartial<FertiliserManuresEntity>[],
    userId: number,
  ): Promise<FertiliserManuresEntity[]> {
    return this.entityManager.transaction(async (transactionalManager) => {
      // Create and save fertiliser manure records
      const savedFertiliserManures = await transactionalManager.save(
        FertiliserManuresEntity,
        data.map((item) =>
          this.repository.create({
            ...item,
            CreatedByID: userId,
          }),
        ),
      );

      // Get unique ManagementPeriodIDs
      const managementPeriodIds = [
        ...new Set(data.map((item) => item.ManagementPeriodID)),
      ];

      // Calculate and update total nutrients for each ManagementPeriodID
      for (const managementPeriodId of managementPeriodIds) {
        const totalNutrients = await this.calculateAndAccumulateTotalNutrients(
          transactionalManager,
          managementPeriodId,
        );

        // Find existing recommendation or create a new one
        const existingRecommendation = await transactionalManager.findOne(
          RecommendationEntity,
          {
            where: { ManagementPeriodID: managementPeriodId },
          },
        );

        if (existingRecommendation) {
          // Update the existing recommendation
          await transactionalManager.update(
            RecommendationEntity,
            { ManagementPeriodID: managementPeriodId },
            totalNutrients,
          );
        } else {
          // Insert a new recommendation
          await transactionalManager.insert(RecommendationEntity, {
            ManagementPeriodID: managementPeriodId,
            ...totalNutrients,
          });
        }
      }

      return savedFertiliserManures;
    });
  }

  private async calculateAndAccumulateTotalNutrients(
    transactionalManager: EntityManager,
    managementPeriodId: number,
  ): Promise<Partial<RecommendationEntity>> {
    // Fetch the new nutrients for the given ManagementPeriodID
    const nutrientsSum = await transactionalManager.find(
      FertiliserManuresEntity,
      {
        where: { ManagementPeriodID: managementPeriodId },
      },
    );

    // Calculate total nutrients from new data
    const newTotalNutrients = nutrientsSum.reduce(
      (acc, current) => {
        acc.N += Number(current.N) || 0;
        acc.P2O5 += Number(current.P2O5) || 0;
        acc.K2O += Number(current.K2O) || 0;
        acc.MgO += Number(current.MgO) || 0;
        acc.SO3 += Number(current.SO3) || 0;
        acc.Na2O += Number(current.Na2O) || 0;
        acc.Lime += Number(current.Lime) || 0;
        return acc;
      },
      {
        N: 0,
        P2O5: 0,
        K2O: 0,
        MgO: 0,
        SO3: 0,
        Na2O: 0,
        Lime: 0,
      },
    );

    return {
      FertilizerN: newTotalNutrients.N,
      FertilizerP2O5: newTotalNutrients.P2O5,
      FertilizerK2O: newTotalNutrients.K2O,
      FertilizerMgO: newTotalNutrients.MgO,
      FertilizerSO3: newTotalNutrients.SO3,
      FertilizerNa2O: newTotalNutrients.Na2O,
      FertilizerLime: newTotalNutrients.Lime,
    };
  }
}
