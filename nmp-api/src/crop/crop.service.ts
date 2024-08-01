import { EntityManager, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import CropEntity from '@db/entity/crop.entity';
import ManagementPeriodEntity from '@db/entity/management-period.entity';
import { ApiDataResponseType } from '@shared/base.response';
import { BaseService } from '@src/base/base.service';

@Injectable()
export class CropService extends BaseService<
  CropEntity,
  ApiDataResponseType<CropEntity>
> {
  constructor(
    @InjectRepository(CropEntity)
    protected readonly repository: Repository<CropEntity>,
    protected readonly entityManager: EntityManager,
    @InjectRepository(ManagementPeriodEntity)
    protected readonly managementPeriodRepository: Repository<ManagementPeriodEntity>,
  ) {
    super(repository, entityManager);
  }

  async createCropWithManagementPeriods(
    fieldId: number,
    cropData: CropEntity,
    managementPeriodData: ManagementPeriodEntity[],
    userId: number,
  ) {
    return await this.entityManager.transaction(
      async (transactionalManager) => {
        const savedCrop = await transactionalManager.save(
          this.repository.create({
            ...cropData,
            FieldID: fieldId,
            CreatedByID: userId,
          }),
        );
        const ManagementPeriods: ManagementPeriodEntity[] = [];
        for (const managementPeriod of managementPeriodData) {
          const savedManagementPeriod = await transactionalManager.save(
            this.managementPeriodRepository.create({
              ...managementPeriod,
              CropID: savedCrop.ID,
              CreatedByID: userId,
            }),
          );
          ManagementPeriods.push(savedManagementPeriod);
        }
        return {
          Crop: savedCrop,
          ManagementPeriods,
        };
      },
    );
  }
}
