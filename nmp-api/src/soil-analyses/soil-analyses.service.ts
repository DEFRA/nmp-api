import SoilAnalysesEntity from '@db/entity/soil-analyses.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiDataResponseType } from '@shared/base.response';
import { BaseService } from '@src/base/base.service';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class SoilAnalysesService extends BaseService<
  SoilAnalysesEntity,
  ApiDataResponseType<SoilAnalysesEntity>
> {
  constructor(
    @InjectRepository(SoilAnalysesEntity)
    protected readonly repository: Repository<SoilAnalysesEntity>,
    protected readonly entityManager: EntityManager,
  ) {
    super(repository, entityManager);
  }
}
