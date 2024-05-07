import SoilAnalysisEntity from '@db/entity/soil-analysis.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiDataResponseType } from '@shared/base.response';
import { BaseService } from '@src/base/base.service';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class SoilAnalysesService extends BaseService<
  SoilAnalysisEntity,
  ApiDataResponseType<SoilAnalysisEntity>
> {
  constructor(
    @InjectRepository(SoilAnalysisEntity)
    protected readonly repository: Repository<SoilAnalysisEntity>,
    protected readonly entityManager: EntityManager,
  ) {
    super(repository, entityManager);
  }
}
