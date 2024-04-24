import FieldEntity from '@db/entity/field.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiDataResponseType } from '@shared/base.response';
import { BaseService } from '@src/base/base.service';
import { EntityManager, Repository } from 'typeorm';
import { CreateFeildWithSoilAnalysesAndCropsDto } from './dto/field.dto';
import SoilAnalysesEntity from '@db/entity/soil-analyses.entity';
import CropEntity from '@db/entity/crop.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FieldService extends BaseService<
  FieldEntity,
  ApiDataResponseType<FieldEntity>
> {
  constructor(
    @InjectRepository(FieldEntity)
    protected readonly repository: Repository<FieldEntity>,
    @InjectRepository(SoilAnalysesEntity)
    protected readonly soilAnalysesRepository: Repository<SoilAnalysesEntity>,
    @InjectRepository(CropEntity)
    protected readonly cropRepository: Repository<CropEntity>,
    protected readonly entityManager: EntityManager,
  ) {
    super(repository, entityManager);
  }

  async createFieldWithSoilAnalysesAndCrops(
    body: CreateFeildWithSoilAnalysesAndCropsDto,
  ) {
    return await this.entityManager.transaction(
      async (transactionalManager) => {
        const Field = await transactionalManager.save(
          this.repository.create(body.Field),
        );
        const SoilAnalyses = await transactionalManager.save(
          this.soilAnalysesRepository.create({
            ...body.SoilAnalyses,
            FieldID: Field.ID,
          }),
        );
        const Crop = await transactionalManager.save(
          this.cropRepository.create({
            ...body.Crop,
            FieldId: Field.ID,
          }),
        );
        return {
          Field,
          SoilAnalyses,
          Crop,
        };
      },
    );
  }
}
