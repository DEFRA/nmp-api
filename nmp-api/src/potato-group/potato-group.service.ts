import { CropTypePotatoGroupEntity } from '@db/entity/crop-type-potato-group.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiDataResponseType } from '@shared/base.response';
import { BaseService } from '@src/base/base.service';
import { RB209ArableService } from '@src/vendors/rb209/arable/arable.service';
import { Repository, EntityManager } from 'typeorm';

@Injectable()
export class PotatoGroupService extends BaseService<
  CropTypePotatoGroupEntity,
  ApiDataResponseType<CropTypePotatoGroupEntity>
> {
  constructor(
    @InjectRepository(CropTypePotatoGroupEntity)
    protected readonly repository: Repository<CropTypePotatoGroupEntity>,
    protected readonly entityManager: EntityManager,
    protected readonly rB209ArableService: RB209ArableService,
  ) {
    super(repository, entityManager);
  }

  async getPotatoGroups(): Promise<any> {
    const potatoGroupsList = await this.rB209ArableService.getData(
      '/Arable/PotatoGroups',
    );
    const cropTypePotatoGroups = await this.repository.find();

    const result = potatoGroupsList.map((group) => ({
      ...group,
      cropTypeId: cropTypePotatoGroups.find(
        (data) => data.PotatoGroupID === group.potatoGroupId,
      )?.CropTypeID,
    }));

    return result;
  }
}
