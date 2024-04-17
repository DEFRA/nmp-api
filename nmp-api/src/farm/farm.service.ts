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

  async farmExistsByNameAndPostcode(farmName: string, postcode: string) {
    return (await this.farmCountByNameAndPostcode(farmName, postcode)) > 0;
  }

  async farmCountByNameAndPostcode(farmName: string, postcode: string) {
    return await this.repository
      .createQueryBuilder('Farms')
      .where('Farms.Name = :name', { name: farmName.trim() })
      .andWhere("REPLACE(Farms.Postcode, ' ', '') = :postcode", {
        postcode: postcode.replaceAll(' ', ''),
      })
      .getCount();
  }
}
