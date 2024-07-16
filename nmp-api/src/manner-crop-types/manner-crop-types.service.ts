import { CropTypeLinkingEntity } from '@db/entity/crop-type-linking.entity';
import { MannerCropTypeEntity } from '@db/entity/manner-crop-type.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiDataResponseType } from '@shared/base.response';
import { BaseService } from '@src/base/base.service';
import { EntityManager, In, Repository } from 'typeorm';

@Injectable()
export class MannerCropTypesService extends BaseService<
  MannerCropTypeEntity,
  ApiDataResponseType<MannerCropTypeEntity>
> {
  constructor(
    @InjectRepository(MannerCropTypeEntity)
    protected readonly repository: Repository<MannerCropTypeEntity>,
    protected readonly entityManager: EntityManager,
    @InjectRepository(CropTypeLinkingEntity)
    protected readonly cropTypeLinkingsRepository: Repository<CropTypeLinkingEntity>,
  ) {
    super(repository, entityManager);
  }

  async getMannerCropTypeInfoByCropTypeID(cropTypeID: number): Promise<any> {
    const cropTypeLinkings = await this.cropTypeLinkingsRepository.find({
      where: { CropTypeID: cropTypeID },
      relations: ['MannerCropType'],
    });

    const mannerCropTypeIds = cropTypeLinkings.map(
      (link) => link.MannerCropTypeID,
    );

    const mannerCropTypes = await this.repository.find({
      where: { ID: In(mannerCropTypeIds) },
    });

    const results = mannerCropTypes.map((mannerCropType) => ({
      MannerCropTypeID: mannerCropType.ID,
      CropUptakeFactor: mannerCropType.CropUptakeFactor,
    }));

    return results;
  }
}
