import FarmEntity from '@db/entity/farm.entity';
// import MixedView from '@db/view/mixed.view';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiDataResponseType } from '@shared/base.response';
import { DeepPartial, EntityManager, In, Repository } from 'typeorm';
import { BaseService } from '../base/base.service';
import ManagementPeriodEntity from '@db/entity/management-period.entity';
import FarmManureTypeEntity from '@db/entity/farm-manure-type.entity';
import CropEntity from '@db/entity/crop.entity';
import FieldEntity from '@db/entity/field.entity';
import { RecommendationEntity } from '@db/entity/recommendation.entity';
import { RecommendationCommentEntity } from '@db/entity/recommendation-comment.entity';
import SoilAnalysisEntity from '@db/entity/soil-analysis.entity';
import { OrganicManureEntity } from '@db/entity/organic-manure.entity';

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
  async deleteFarmAndRelatedEntities(farmId: number): Promise<void> {
    const farmToDelete = await this.getById(farmId);
    if (farmToDelete.records==null) {
      throw new NotFoundException(`Farm with ID ${farmId} not found`);
    }

    try {
      const storedProcedure =
        'EXEC dbo.spFarms_DeleteFarmAndRelatedEntities @farmId = @0';
      await this.entityManager.query(storedProcedure, [farmId]);
    } catch (error) {
      console.error('Error deleting farm:', error);
      throw new HttpException(
        'Error deleting farm',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}



