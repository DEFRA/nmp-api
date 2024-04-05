import FarmEntity from '@db/entity/farm.entity';
// import MixedView from '@db/view/mixed.view';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiDataResponseType } from '@shared/base.response';
import { EntityManager, Repository } from 'typeorm';
import { BaseService } from '../base/base.service';

@Injectable()
export class FarmService extends BaseService<
  FarmEntity,
  ApiDataResponseType<FarmEntity>
> {
  constructor(
    @InjectRepository(FarmEntity)
    protected readonly repository: Repository<FarmEntity>,
    protected readonly entityManager: EntityManager,
  ) {
    super(repository, entityManager);
  }

  async get() {
    try {
    } catch (error) {
      console.error('Error while fetching join data:', error);
      throw error;
    }
  }
}
