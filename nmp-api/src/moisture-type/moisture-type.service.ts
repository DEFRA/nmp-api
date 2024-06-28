import { MoistureTypeEntity } from '@db/entity/moisture-type.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiDataResponseType } from '@shared/base.response';
import { BaseService } from '@src/base/base.service';
import { Repository, EntityManager } from 'typeorm';

@Injectable()
export class MoistureTypeService extends BaseService<
  MoistureTypeEntity,
  ApiDataResponseType<MoistureTypeEntity>
> {
  constructor(
    @InjectRepository(MoistureTypeEntity)
    protected readonly repository: Repository<MoistureTypeEntity>,
    protected readonly entityManager: EntityManager,
  ) {
    super(repository, entityManager);
  }
}
