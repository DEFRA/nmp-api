import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, DeepPartial } from 'typeorm';
import { BaseService } from '../base/base.service';
import { FertiliserManuresEntity } from '@db/entity/fertiliser-manures.entity';
import { ApiDataResponseType } from '@shared/base.response';
import { OrganicManureEntity } from '@db/entity/organic-manure.entity';

@Injectable()
export class FertiliserManuresService extends BaseService<
  FertiliserManuresEntity,
  ApiDataResponseType<FertiliserManuresEntity>
> {
  constructor(
    @InjectRepository(FertiliserManuresEntity)
    protected readonly repository: Repository<FertiliserManuresEntity>,
    @InjectRepository(OrganicManureEntity)
    protected readonly organicManureRepository: Repository<OrganicManureEntity>,
    protected readonly entityManager: EntityManager,
  ) {
    super(repository, entityManager);
  }
  async getFertiliserManureNitrogenSum(
    managementPeriodID: number,
    fromDate: Date,
    toDate: Date,
    confirm: boolean,
  ) {
    const result = await this.repository
      .createQueryBuilder('fertiliserManures')
      .select(
        'SUM(fertiliserManures.N * fertiliserManures.ApplicationRate)',
        'totalN',
      )
      .where('fertiliserManures.ManagementPeriodID = :managementPeriodID', {
        managementPeriodID,
      })
      .andWhere(
        'fertiliserManures.ApplicationDate BETWEEN :fromDate AND :toDate',
        { fromDate, toDate },
      )
      .andWhere('fertiliserManures.Confirm =:confirm', { confirm })
      .getRawOne();

    return result.totalN;
  }

  async getTotalNitrogen(managementPeriodID: number, confirm: boolean) {
    const fertiliserManuresResult = await this.repository
      .createQueryBuilder('fertiliserManures')
      .select(
        'SUM(fertiliserManures.N * fertiliserManures.ApplicationRate)',
        'totalN',
      )
      .where('fertiliserManures.ManagementPeriodID = :managementPeriodID', {
        managementPeriodID,
      })
      .andWhere('fertiliserManures.Confirm =:confirm', { confirm })
      .getRawOne();

    const organicManuresResult = await this.organicManureRepository
      .createQueryBuilder('organicManures')
      .select(
        'SUM(organicManures.N * organicManures.ApplicationRate)',
        'totalN',
      )
      .where('organicManures.ManagementPeriodID = :managementPeriodID', {
        managementPeriodID,
      })
      .andWhere('organicManures.Confirm =:confirm', { confirm })
      .getRawOne();
    const totalN = fertiliserManuresResult.totalN + organicManuresResult.totalN;
    return totalN;
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

      // Return the saved fertiliser manures
      return savedFertiliserManures;
    });
  }
}
