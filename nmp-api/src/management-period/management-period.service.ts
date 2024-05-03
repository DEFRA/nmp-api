import ManagementPeriodEntity from '@db/entity/management-period.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiDataResponseType } from '@shared/base.response';
import { BaseService } from '@src/base/base.service';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class ManagementPeriodService extends BaseService<
ManagementPeriodEntity,
  ApiDataResponseType<ManagementPeriodEntity>
> {
  constructor(
    @InjectRepository(ManagementPeriodEntity)
    protected readonly repository: Repository<ManagementPeriodEntity>,
    protected readonly entityManager: EntityManager,
  ) {
    super(repository, entityManager);
  }
}
