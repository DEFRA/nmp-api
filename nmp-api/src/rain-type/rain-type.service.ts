// rain-type.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { RainTypeEntity } from '@db/entity/rain-type.entity';
import { ApiDataResponseType } from '@shared/base.response';
import { BaseService } from '@src/base/base.service';
import { MannerRainTypesService } from '@src/vendors/manner/rain-types/rain-types.service';

@Injectable()
export class RainTypeService extends BaseService<
  RainTypeEntity,
  ApiDataResponseType<RainTypeEntity>
> {
  constructor(
    @InjectRepository(RainTypeEntity)
    protected readonly repository: Repository<RainTypeEntity>,
    protected readonly entityManager: EntityManager,
    protected readonly MannerRainTypesService: MannerRainTypesService,
  ) {
    super(repository, entityManager);
  }

  async findFirstRow(): Promise<any> {
    // Fetch the rain types list from the manner service
    const rainMannerList =
      await this.MannerRainTypesService.getData('rain-types');
    

    // Check if the response was successful and data exists
    if (rainMannerList.success && rainMannerList.data) {
      // Sort the rain types by ID in ascending order and take the first one
      const sortedList = rainMannerList.data.sort(
        (a: any, b: any) => a.ID - b.ID,
      );

      // Return the first row from the sorted list
      const firstRow = sortedList[0];

      return firstRow;
    } else {
      throw new Error('Failed to fetch rain type data or data is unavailable');
    }
  }
}
