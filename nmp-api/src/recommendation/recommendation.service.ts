import CropEntity from '@db/entity/crop.entity';
import FarmEntity from '@db/entity/farm.entity';
import FieldEntity from '@db/entity/field.entity';
import ManagementPeriodEntity from '@db/entity/management-period.entity';
import { RecommendationEntity } from '@db/entity/recommendation.entity';
import SoilAnalysisEntity from '@db/entity/soil-analysis.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiDataResponseType } from '@shared/base.response';
import { BaseService } from '@src/base/base.service';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class RecommendationService extends BaseService<
  RecommendationEntity,
  ApiDataResponseType<RecommendationEntity>
> {
  constructor(
    @InjectRepository(RecommendationEntity)
    protected readonly repository: Repository<RecommendationEntity>,
    protected readonly entityManager: EntityManager,
    @InjectRepository(ManagementPeriodEntity)
    protected readonly managementPeriodRepository: Repository<ManagementPeriodEntity>,
    @InjectRepository(CropEntity)
    protected readonly cropRepository: Repository<CropEntity>,
    @InjectRepository(FieldEntity)
    protected readonly fieldRepository: Repository<FieldEntity>,
    @InjectRepository(FarmEntity)
    protected readonly farmRepository: Repository<FarmEntity>,
    @InjectRepository(SoilAnalysisEntity)
    protected readonly soilAnalysisRepository: Repository<SoilAnalysisEntity>,
  ) {
    super(repository, entityManager);
  }

  async createRecommendationsForFieldByFieldId(
    fieldId: number,
    cropData: CropEntity,
    managementPeriodData: ManagementPeriodEntity[],
  ) {
    return await this.entityManager.transaction(
      async (transactionalManager) => {
        const savedCrop = await transactionalManager.save(
          this.cropRepository.create({
            ...cropData,
            FieldID: fieldId,
          }),
        );
        const ManagementPeriods: ManagementPeriodEntity[] = [];
        for (const managementPeriod of managementPeriodData) {
          const savedManagementPeriod = await transactionalManager.save(
            this.managementPeriodRepository.create({
              ...managementPeriod,
              CropID: savedCrop.ID,
            }),
          );
          ManagementPeriods.push(savedManagementPeriod);
        }

        const field = await this.fieldRepository.findOneBy({
          ID: fieldId,
        });

        const farm = await this.farmRepository.findOneBy({
          ID: field.FarmID,
        });

        const latestSoilAnalysis = (
          await this.soilAnalysisRepository.find({
            where: { FieldID: fieldId },
            order: { Date: 'DESC' },
            take: 1,
          })
        )[0];
        return {};
      },
    );
  }
}
