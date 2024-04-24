import CropEntity from '@db/entity/crop.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiDataResponseType } from '@shared/base.response';
import { BaseService } from '@src/base/base.service';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class CropService extends BaseService<
  CropEntity,
  ApiDataResponseType<CropEntity>
> {
  constructor(
    @InjectRepository(CropEntity)
    protected readonly repository: Repository<CropEntity>,
    protected readonly entityManager: EntityManager,
  ) {
    super(repository, entityManager);
  }
}
