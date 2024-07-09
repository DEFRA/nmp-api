import FarmEntity from '@db/entity/farm.entity';
// import MixedView from '@db/view/mixed.view';
import {
  BadRequestException,
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
  async deleteFarmAndRelatedEntities(farmId: number): Promise<boolean> {
    return await this.entityManager.transaction(
      async (transactionalEntityManager) => {
        try {
          // Fetch all related entities in bulk
          const fields = await transactionalEntityManager.find(FieldEntity, {
            where: { FarmID: farmId },
          });

          const fieldIds = fields.map((field) => field.ID);

          const crops = await transactionalEntityManager.find(CropEntity, {
            where: { FieldID: In(fieldIds) },
          });

          const cropIds = crops.map((crop) => crop.ID);

          const managementPeriods = await transactionalEntityManager.find(
            ManagementPeriodEntity,
            {
              where: { CropID: In(cropIds) },
            },
          );

          const managementPeriodIds = managementPeriods.map((mp) => mp.ID);

          const recommendations = await transactionalEntityManager.find(
            RecommendationEntity,
            {
              where: { ManagementPeriodID: In(managementPeriodIds) },
            },
          );

          const recommendationIds = recommendations.map(
            (recommendation) => recommendation.ID,
          );

          const recommendationComments = await transactionalEntityManager.find(
            RecommendationCommentEntity,
            {
              where: { RecommendationID: In(recommendationIds) },
            },
          );

          const soilAnalyses = await transactionalEntityManager.find(
            SoilAnalysisEntity,
            {
              where: { FieldID: In(fieldIds) },
            },
          );

          const organicManures = await transactionalEntityManager.find(
            OrganicManureEntity,
            {
              where: { ManagementPeriodID: In(managementPeriodIds) },
            },
          );

          // Perform bulk deletions
          await transactionalEntityManager.delete(RecommendationCommentEntity, {
            ID: In(recommendationComments.map((comment) => comment.ID)),
          });
          await transactionalEntityManager.delete(RecommendationEntity, {
            ID: In(recommendationIds),
          });
          await transactionalEntityManager.delete(OrganicManureEntity, {
            ID: In(organicManures.map((om) => om.ID)),
          });
          await transactionalEntityManager.delete(ManagementPeriodEntity, {
            ID: In(managementPeriodIds),
          });
          await transactionalEntityManager.delete(CropEntity, {
            ID: In(cropIds),
          });
          await transactionalEntityManager.delete(SoilAnalysisEntity, {
            ID: In(soilAnalyses.map((sa) => sa.ID)),
          });
          await transactionalEntityManager.delete(FieldEntity, {
            ID: In(fieldIds),
          });

          // Delete farm entity itself
          const result = await transactionalEntityManager.delete(
            FarmEntity,
            farmId,
          );
          if (result.affected === 0) {
            throw new NotFoundException(`Farm with ID ${farmId} not found`);
          }

          return true;
        } catch (error) {
          console.error('Error deleting farm and related entities:', error);
          throw error;
        }
      },
    );
  }
}
