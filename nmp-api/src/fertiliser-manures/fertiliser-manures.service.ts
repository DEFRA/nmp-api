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
    return await this.entityManager.transaction(
      async (transactionalManager) => {
        const fertiliserManures = data.map((item) => {
          return this.repository.create({
            ...item,
            CreatedByID: userId,
          });
        });

        const savedFertiliserManures = await transactionalManager.save(
          FertiliserManuresEntity,
          fertiliserManures,
        );

        // Calculate the sum for each nutrient for the corresponding ManagementPeriodID
        const managementPeriodId = data[0].ManagementPeriodID;
        const nutrientsSum = await transactionalManager.find(
          FertiliserManuresEntity,
          {
            where: { ManagementPeriodID: managementPeriodId },
          },
        );

        const totalNutrients = nutrientsSum.reduce(
          (acc, current) => {
            acc.N += Number(current.N);
            acc.P2O5 += Number(current.P2O5);
            acc.K2O += Number(current.K2O);
            acc.MgO += Number(current.MgO);
            acc.SO3 += Number(current.SO3);
            acc.Na2O += Number(current.Na2O);
            acc.Lime += Number(current.Lime);
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

        // Update the corresponding RecommendationEntity with the calculated total values
        await transactionalManager.update(
          RecommendationEntity,
          { ManagementPeriodID: managementPeriodId },
          {
            FertilizerN: totalNutrients.N,
            FertilizerP2O5: totalNutrients.P2O5,
            FertilizerK2O: totalNutrients.K2O,
            FertilizerMgO: totalNutrients.MgO,
            FertilizerSO3: totalNutrients.SO3,
            FertilizerNa2O: totalNutrients.Na2O,
            FertilizerLime: totalNutrients.Lime,
          },
        );

        return savedFertiliserManures;
      },
    );
  }
}
