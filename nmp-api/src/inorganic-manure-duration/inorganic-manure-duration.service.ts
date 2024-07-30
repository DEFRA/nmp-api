import { InOrganicManureDurationEntity } from '@db/entity/inorganic-manure-duration.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiDataResponseType } from '@shared/base.response';
import { BaseService } from '@src/base/base.service';
import { Repository, EntityManager } from 'typeorm';

@Injectable()
export class InorganicManureDurationService extends BaseService<
  InOrganicManureDurationEntity,
  ApiDataResponseType<InOrganicManureDurationEntity>
> {
  constructor(
    @InjectRepository(InOrganicManureDurationEntity)
    protected readonly repository: Repository<InOrganicManureDurationEntity>,
    protected readonly entityManager: EntityManager,
  ) {
    super(repository, entityManager);
  }

  async getInorganicManureDurations() {
    const inorganicManureDurations = (await this.repository.find()).map(
      (data) => ({ ID: data.ID, Name: data.Name }),
    );

    return inorganicManureDurations;
  }
}
