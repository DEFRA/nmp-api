import { ManureGroupEntity } from '@db/entity/manure-group.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiDataResponseType } from '@shared/base.response';
import { BaseService } from '@src/base/base.service';
import { Repository, EntityManager } from 'typeorm';

@Injectable()
export class ManureGroupService extends BaseService<
  ManureGroupEntity,
  ApiDataResponseType<ManureGroupEntity>
> {
  constructor(
    @InjectRepository(ManureGroupEntity)
    protected readonly repository: Repository<ManureGroupEntity>,
    protected readonly entityManager: EntityManager,
  ) {
    super(repository, entityManager);
  }
}
