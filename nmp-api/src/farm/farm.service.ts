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

  async farmExistsByNameAndPostcode(
    farmName: string,
    postcode: string,
    id?: number,
  ) {
    return (await this.farmCountByNameAndPostcode(farmName, postcode, id)) > 0;
  }

  async farmCountByNameAndPostcode(
    farmName: string,
    postcode: string,
    id?: number,
  ) {
    if (!farmName || !postcode) {
      throw new BadRequestException('Farm Name and Postcode are required');
    }

    const query = this.repository
      .createQueryBuilder('Farms')
      .where('Farms.Name = :name', { name: farmName.trim() })
      .andWhere("REPLACE(Farms.Postcode, ' ', '') = :postcode", {
        postcode: postcode.replaceAll(' ', ''),
      })
      .andWhere(id !== undefined ? 'Farms.ID != :id' : '1 = 1', { id });

    return await query.getCount();
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
    return await this.entityManager.transaction(
      async (transactionalManager) => {
        // Fetch the existing farm record
        const existingFarm = await transactionalManager.findOne(FarmEntity, {
          where: { ID: farmId },
        });

        if (!existingFarm) {
          throw new NotFoundException(`Farm with ID ${farmId} not found`);
        }

        // Prepare the update data for the farm entity
        const farmUpdateData: DeepPartial<FarmEntity> = {
          Address1: updatedFarmData.Address1,
          Address2: updatedFarmData.Address2,
          Address3: updatedFarmData.Address3,
          Address4: updatedFarmData.Address4,
          AverageAltitude: updatedFarmData.AverageAltitude,
          BusinessName: updatedFarmData.BusinessName,
          CPH: updatedFarmData.CPH,
          CreatedByID: updatedFarmData.CreatedByID,
          CreatedOn: updatedFarmData.CreatedOn,
          Email: updatedFarmData.Email,
          EnglishRules: updatedFarmData.EnglishRules,
          FarmerName: updatedFarmData.FarmerName,
          MetricUnits: updatedFarmData.MetricUnits,
          Mobile: updatedFarmData.Mobile,
          OrganisationID: updatedFarmData.OrganisationID,
          Rainfall: updatedFarmData.Rainfall,
          RegisteredOrganicProducer: updatedFarmData.RegisteredOrganicProducer,
          SBI: updatedFarmData.SBI,
          STD: updatedFarmData.STD,
          Telephone: updatedFarmData.Telephone,
          TotalFarmArea: updatedFarmData.TotalFarmArea,
          Name: updatedFarmData.Name?.trim(),
          Postcode: updatedFarmData.Postcode?.trim(),
          ModifiedByID: userId,
          ModifiedOn: new Date(),
          // FieldsAbove300SeaLevel and NVZFields will be updated in the `field` table only if the condition is not met
          FieldsAbove300SeaLevel: updatedFarmData.FieldsAbove300SeaLevel,
          NVZFields: updatedFarmData.NVZFields,
        };

        // Perform the farm update
        const result = await transactionalManager.update(
          FarmEntity,
          farmId,
          farmUpdateData,
        );

        if (result.affected === 0) {
          throw new NotFoundException(`Farm with ID ${farmId} not found`);
        }

        // Check if we need to update the field entity conditionally
        if (
          updatedFarmData.FieldsAbove300SeaLevel !== 2 ||
          updatedFarmData.NVZFields !== 2
        ) {
          const fieldUpdateData: Partial<FieldEntity> = {};

          if (updatedFarmData.FieldsAbove300SeaLevel !== 2) {
            fieldUpdateData.IsAbove300SeaLevel =
              updatedFarmData.FieldsAbove300SeaLevel === 1;
          }

          if (updatedFarmData.NVZFields !== 2) {
            fieldUpdateData.IsWithinNVZ = updatedFarmData.NVZFields === 1;
          }

          // Assuming you have a field repository to perform the update
          await transactionalManager.update(
            FieldEntity,
            { FarmID: farmId },
            fieldUpdateData,
          );
        }

        // Fetch and return the updated farm record
        const updatedFarm = await transactionalManager.findOne(FarmEntity, {
          where: { ID: farmId },
        });

        return updatedFarm;
      },
    );
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
    if (farmToDelete.records == null) {
      throw new NotFoundException(`Farm with ID ${farmId} not found`);
    }
    try {
      const storedProcedure = 'EXEC dbo.spFarms_DeleteFarm @farmId = @0';
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
