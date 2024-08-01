import { MoistureTypeEntity } from '@db/entity/moisture-type.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiDataResponseType } from '@shared/base.response';
import { validateISODateFormat } from '@shared/dateValidate';
import { BaseService } from '@src/base/base.service';
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
  ) {
    super(repository, entityManager);
  }

  async getDefaultSoilMoistureType(applicationDate: string) {
    const date = validateISODateFormat(applicationDate);

    const month = date.getMonth() + 1;
    const soilMoistureType =
      month == 5 || month == 6 || month == 7 ? 'Dry' : 'Moist';

    const moistureType = await this.repository.findOneBy({
      Name: soilMoistureType,
    });
    return moistureType;
  }
}
