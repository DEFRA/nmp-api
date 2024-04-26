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

  async checkFieldExists(farmId: number, name: string) {
    return await this.recordExists({ FarmID: farmId, Name: name });
  }

  async throwErrorIfFieldExists(exists: boolean) {
    if (exists)
      throw new Error('Field already exists with this Farm Id and Name');
  }

  async createFieldWithSoilAnalysesAndCrops(
    farmId: number,
    body: CreateFeildWithSoilAnalysesAndCropsDto,
  ) {
    const exists = await this.checkFieldExists(farmId, body.Field.Name);
    this.throwErrorIfFieldExists(exists);

    return await this.entityManager.transaction(
      async (transactionalManager) => {
        const Field = await transactionalManager.save(
          this.repository.create({ ...body.Field, FarmID: farmId }),
        );
        const SoilAnalyses = await transactionalManager.save(
          this.soilAnalysesRepository.create({
            ...body.SoilAnalyses,
            FieldID: Field.ID,
          }),
        );

        const Crops: CropEntity[] = [];
        for (const cropData of body.Crops) {
          const savedCrop = await transactionalManager.save(
            this.cropRepository.create({
              ...cropData,
              FieldID: Field.ID,
            }),
          );
          Crops.push(savedCrop);
        }

        return {
          Field,
          SoilAnalyses,
          Crops,
        };
      },
    );
  }
}
