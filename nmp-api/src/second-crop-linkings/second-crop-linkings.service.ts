import { SecondCropLinkingEntity } from '@db/entity/second-crop-linking.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiDataResponseType } from '@shared/base.response';
import { BaseService } from '@src/base/base.service';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class SecondCropLinkingsService extends BaseService<
  SecondCropLinkingEntity,
  ApiDataResponseType<SecondCropLinkingEntity>
> {
  constructor(
    @InjectRepository(SecondCropLinkingEntity)
    protected readonly repository: Repository<SecondCropLinkingEntity>,
    protected readonly entityManager: EntityManager,
  ) {
    super(repository, entityManager);
  }

  async getSecondCropTypeLinkingByFirstCropId(firstCropID: number) {
    const secondCropTypes = await this.repository.find({
      where: { FirstCropID: firstCropID },
      select: ['SecondCropID'], // Select only the SecondCropID field
    });

    // Extract the SecondCropIDs from the result
    const secondCropIDs = secondCropTypes.map((item) => item.SecondCropID);

    return secondCropIDs;
  }
}
