import FarmEntity from '@db/entity/farm.entity';
// import MixedView from '@db/view/mixed.view';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiDataResponseType } from '@shared/base.response';
import { DeepPartial, EntityManager, Repository } from 'typeorm';
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
    if (!farmName || !postcode)
      throw new BadRequestException('Farm Name and Postcode are required');
    return await this.repository
      .createQueryBuilder('Farms')
      .where('Farms.Name = :name', { name: farmName.trim() })
      .andWhere("REPLACE(Farms.Postcode, ' ', '') = :postcode", {
        postcode: postcode.replaceAll(' ', ''),
      })
      .getCount();
  }

  async createFarm(
    farmBody: DeepPartial<FarmEntity>,
    // UserID: number,
    // RoleID: number,
  ) {
    const Farm = await this.repository.save({
      ...farmBody,
      Name: farmBody.Name.trim(),
      Postcode: farmBody.Postcode.trim(),
    });
    // await transactionalEntityManager.save(
    //   this.repository.create({
    //     UserID,
    //     RoleID,
    //     FarmID: Farm.ID,
    //   }),
    // );
    return Farm;
  }
}
