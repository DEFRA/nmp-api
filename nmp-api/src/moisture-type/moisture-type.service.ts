import { MoistureTypeEntity } from '@db/entity/moisture-type.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiDataResponseType } from '@shared/base.response';
import { validateISODateFormat } from '@shared/dateValidate';
import { BaseService } from '@src/base/base.service';
import { MannerMoistureTypesService } from '@src/vendors/manner/moisture-types/moisture-types.service';
import { Repository, EntityManager } from 'typeorm';

@Injectable()
export class MoistureTypeService extends BaseService<
  MoistureTypeEntity,
  ApiDataResponseType<MoistureTypeEntity>
> {
  constructor(
    @InjectRepository(MoistureTypeEntity)
    protected readonly repository: Repository<MoistureTypeEntity>,
    protected readonly entityManager: EntityManager,
    protected readonly moistureMannerService: MannerMoistureTypesService,
  ) {
    super(repository, entityManager);
  }

  async getDefaultSoilMoistureType(applicationDate: string) {
    const date = validateISODateFormat(applicationDate);
    //calling manner api
    const moisturTypeList =
      await this.moistureMannerService.getData('moisture-types');

    if (moisturTypeList.success && moisturTypeList.data) {
      // Get the month from the application date
      const month = date.getMonth() + 1;

      // Determine soil moisture type based on the month
      const soilMoistureType =
        month === 5 || month === 6 || month === 7 ? 'Dry' : 'Moist';

      // Find the corresponding moisture type in the manner data
      const moistureType = moisturTypeList.data.find(
        (item: any) => item.name === soilMoistureType,
      );

      return moistureType;
    } else {
      throw new Error('Failed to fetch moisture types or data is unavailable');
    }
  }
}
