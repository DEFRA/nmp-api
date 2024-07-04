// rain-type.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { RainTypeEntity } from '@db/entity/rain-type.entity';
import { ApiDataResponseType } from '@shared/base.response';
import { BaseService } from '@src/base/base.service';

@Injectable()
export class RainTypeService extends BaseService<
  RainTypeEntity,
  ApiDataResponseType<RainTypeEntity>
> {
  constructor(
    @InjectRepository(RainTypeEntity)
    protected readonly repository: Repository<RainTypeEntity>,
    protected readonly entityManager: EntityManager,
  ) {
    super(repository, entityManager);
  }


  async findFirstRow(): Promise<RainTypeEntity> {
    const result = await this.repository.find({
      order: { ID: 'ASC' },
      take: 1,
    });
    const data = result[0];
    return data;
  }
}
