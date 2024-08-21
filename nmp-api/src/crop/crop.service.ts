import { EntityManager, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import CropEntity from '@db/entity/crop.entity';
import ManagementPeriodEntity from '@db/entity/management-period.entity';
import { ApiDataResponseType } from '@shared/base.response';
import { BaseService } from '@src/base/base.service';
import { RB209ArableService } from '@src/vendors/rb209/arable/arable.service';

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
    protected readonly rB209ArableService: RB209ArableService,
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

  async getCropTypeDataByFieldAndYear(
    fieldId: number,
    year: number,
  ): Promise<any> {
    // Step 1: Retrieve the CropTypeID based on fieldId and year
    const cropData = (
      await this.repository.find({
        where: {
          FieldID: fieldId,
          Year: year,
        },
      })
    )[0];

    const cropTypeId = cropData.CropTypeID;

    const cropTypesList =
      await this.rB209ArableService.getData('/Arable/CropTypes');

    const cropType = cropTypesList.find(
      (cropType) => cropType.cropTypeId === cropTypeId,
    );

    if (!cropType) {
      console.error(`No crop type found for CropTypeID: ${cropTypeId}`);
    }

    return {
      cropTypeId: cropType.cropTypeId,
      cropType: cropType.cropType,
    };
  }
}
