import { Injectable } from '@nestjs/common';

import { BaseService } from '@src/base/base.service';
import { ManureTypeEntity } from '@db/entity/manure-type.entity';
import { ApiDataResponseType } from '@shared/base.response';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';

@Injectable()
export class ManureTypeService extends BaseService<
  ManureTypeEntity,
  ApiDataResponseType<ManureTypeEntity>
> {
  constructor(
    @InjectRepository(ManureTypeEntity)
    protected readonly repository: Repository<ManureTypeEntity>,
    protected readonly entityManager: EntityManager,
  ) {
    super(repository, entityManager);
  }

  async getManureTypes(manureGroupId: number, countryId: number) {
    const manureTypes = await this.repository.find({
      where: {
        ManureGroupID: manureGroupId,
        CountryID: In([countryId, 3]),
      },
    });
    return { ManureTypes: manureTypes };
  }
}
