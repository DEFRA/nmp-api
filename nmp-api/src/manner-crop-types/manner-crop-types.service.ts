    import { CropTypeLinkingEntity } from '@db/entity/crop-type-linking.entity';
    import { MannerCropTypeEntity } from '@db/entity/manner-crop-type.entity';
    import { Injectable } from '@nestjs/common';
    import { InjectRepository } from '@nestjs/typeorm';
    import { BaseService } from '@src/base/base.service';
    import { EntityManager, Repository } from 'typeorm';


    @Injectable()
    export class MannerCropTypesService extends BaseService<
      MannerCropTypeEntity,
      any
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

      async findByCropTypeID(cropTypeID: number): Promise<any> {
        const cropTypeLinkings = await this.cropTypeLinkingsRepository.find({
          where: { CropTypeID: cropTypeID },
          relations: ['MannerCropType'],
        });

        const results = cropTypeLinkings.map((link) => ({
          MannerCropTypeID: link.MannerCropTypeID,
          CropUptakeFactor: link.MannerCropType.CropUptakeFactor,
        }));

        return results;
      }
    }
