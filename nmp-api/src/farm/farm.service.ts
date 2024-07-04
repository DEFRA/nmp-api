import FarmEntity from '@db/entity/farm.entity';
// import MixedView from '@db/view/mixed.view';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    userId: number,
    // UserID: number,
    // RoleID: number,
  ) {
    const Farm = await this.repository.save({
      ...farmBody,
      Name: farmBody.Name.trim(),
      Postcode: farmBody.Postcode.trim(),
      CreatedByID: userId,
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

  async updateFarm(
    updatedFarmData: DeepPartial<FarmEntity>,
    userId: number,
    farmId: number,
  ) {
    const result = await this.repository.update(farmId, {
      ...updatedFarmData,
      Name: updatedFarmData.Name.trim(),
      Postcode: updatedFarmData.Postcode.trim(),
      ModifiedByID: userId,
      ModifiedOn: new Date(),
    });

    if (result.affected === 0) {
      throw new NotFoundException(`Farm with ID ${farmId} not found`);
    }

    const updatedFarm = await this.repository.findOne({
      where: { ID: farmId },
    });
    return updatedFarm;
  }

  async getFarm(name: string, postcode: string) {
    const farm = await this.repository.findOne({
      where: {
        Name: name.trim(),
        Postcode: postcode.trim(),
      },
    });
    return farm;
  }
}
