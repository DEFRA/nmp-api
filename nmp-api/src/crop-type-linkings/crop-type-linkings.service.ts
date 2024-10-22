import { CropTypeLinkingEntity } from '@db/entity/crop-type-linking.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiDataResponseType } from '@shared/base.response';
import { BaseService } from '@src/base/base.service';
import { Repository, EntityManager } from 'typeorm';

@Injectable()
export class CropTypeLinkingsService extends BaseService<
  CropTypeLinkingEntity,
  ApiDataResponseType<CropTypeLinkingEntity>
> {
  constructor(
    @InjectRepository(CropTypeLinkingEntity)
    protected readonly repository: Repository<CropTypeLinkingEntity>,
    protected readonly entityManager: EntityManager,
  ) {
    super(repository, entityManager);
  }
  async getCropTypeLinkingByCropTypeID(cropTypeID: number) {
    const cropType = await this.repository.findOneBy({
      CropTypeID: cropTypeID,
    });

    return cropType;
  }
}
