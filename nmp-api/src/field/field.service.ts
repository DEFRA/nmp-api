import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

import FieldEntity from '@db/entity/field.entity';
import { ApiDataResponseType } from '@shared/base.response';
import { BaseService } from '@src/base/base.service';

import SoilAnalysisEntity from '@db/entity/soil-analysis.entity';
import CropEntity from '@db/entity/crop.entity';
import ManagementPeriodEntity from '@db/entity/management-period.entity';

import { CreateFieldWithSoilAnalysisAndCropsDto } from './dto/field.dto';
import { CreateCropWithManagementPeriodsDto } from '@src/crop/dto/crop.dto';

@Injectable()
export class FieldService extends BaseService<
  FieldEntity,
  ApiDataResponseType<FieldEntity>
> {
  constructor(
    @InjectRepository(FieldEntity)
    protected readonly repository: Repository<FieldEntity>,
    @InjectRepository(SoilAnalysisEntity)
    protected readonly soilAnalysisRepository: Repository<SoilAnalysisEntity>,
    @InjectRepository(CropEntity)
    protected readonly cropRepository: Repository<CropEntity>,
    @InjectRepository(ManagementPeriodEntity)
    protected readonly managementPeriodRepository: Repository<ManagementPeriodEntity>,
    protected readonly entityManager: EntityManager,
  ) {
    super(repository, entityManager);
  }

  async checkFieldExists(farmId: number, name: string) {
    return await this.recordExists({ FarmID: farmId, Name: name });
  }

  async throwErrorIfFieldExists(exists: boolean) {
    if (exists)
      throw new Error('Field already exists with this Farm Id and Name');
  }

  async createFieldWithSoilAnalysisAndCrops(
    farmId: number,
    body: CreateFieldWithSoilAnalysisAndCropsDto,
  ) {
    const exists = await this.checkFieldExists(farmId, body.Field.Name);
    this.throwErrorIfFieldExists(exists);

    return await this.entityManager.transaction(
      async (transactionalManager) => {
        const Field = await transactionalManager.save(
          this.repository.create({ ...body.Field, FarmID: farmId }),
        );
        const SoilAnalysis = await transactionalManager.save(
          this.soilAnalysisRepository.create({
            ...body.SoilAnalysis,
            FieldID: Field.ID,
          }),
        );
        const Crops: CreateCropWithManagementPeriodsDto[] = [];
        for (const cropData of body.Crops) {
          const savedCrop = await transactionalManager.save(
            this.cropRepository.create({
              ...cropData.Crop,
              FieldID: Field.ID,
            }),
          );
          const ManagementPeriods: ManagementPeriodEntity[] = [];
          for (const managementPeriod of cropData.ManagementPeriods) {
            const savedManagementPeriod = await transactionalManager.save(
              this.managementPeriodRepository.create({
                ...managementPeriod,
                CropID: savedCrop.ID,
              }),
            );
            ManagementPeriods.push(savedManagementPeriod);
          }
          Crops.push({ Crop: savedCrop, ManagementPeriods });
        }

        return {
          Field,
          SoilAnalysis,
          Crops,
        };
      },
    );
  }
}
