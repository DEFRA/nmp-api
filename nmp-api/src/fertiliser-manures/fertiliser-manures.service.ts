import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, DeepPartial } from 'typeorm';
import { BaseService } from '../base/base.service';
import { FertiliserManuresEntity } from '@db/entity/fertiliser-manures.entity';
import { ApiDataResponseType } from '@shared/base.response';

@Injectable()
export class FertiliserManuresService extends BaseService<
  FertiliserManuresEntity,
  ApiDataResponseType<FertiliserManuresEntity>
> {
  constructor(
    @InjectRepository(FertiliserManuresEntity)
    protected readonly repository: Repository<FertiliserManuresEntity>,
    protected readonly entityManager: EntityManager,
  ) {
    super(repository, entityManager);
  }

  async createFertiliserManures(
    data: DeepPartial<FertiliserManuresEntity>[],
    userId: number,
  ): Promise<FertiliserManuresEntity[]> {
    const fertiliserManures = data.map((item) =>
      this.repository.create({
        ...item,
        CreatedByID: userId,
      }),
    );
    return this.repository.save(fertiliserManures);
  }
}
